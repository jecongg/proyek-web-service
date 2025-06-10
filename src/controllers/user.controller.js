const User = require("../models/User");
const Hero = require("../models/Hero");
require("../models/Skin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();
const userValidation = require("../validation/user.validation");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const Match = require("../models/Match");

async function isValidRegion(region) {
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${region}`);
        // Bisa valid jika respons mengandung data negara
        return response.data && response.data.length > 0;
    } catch (error) {
        return false;
    }
}

// Ambil semua user (lengkap dengan hero dan skin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("username email gender region role -_id")
            .populate("owned_heroes")
            .populate({
                path: "owned_skins",
                populate: { path: "id_hero" },
            });

        res.json({
            messages: "Successfully fetched user!",
            count_user: users.length,
            users,
        });
    } catch (error) {
        console.error("Error getAllUsers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Ambil user berdasarkan username
exports.getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .populate("owned_heroes")
            .populate({
                path: "owned_skins",
                populate: { path: "id_hero" },
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error getUserByUsername:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//Note: Belum selesai
exports.register = async (req, res) => {
    // Validasi input dengan Joi
    const { error } = userValidation.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map((err) => err.message),
        });
    }

    const { username, password, email, gender, region, role } = req.body;

    try {
        //Cek region valid dari API negara
        const regionValid = await isValidRegion(region);
        if (!regionValid) {
            return res.status(400).json({ message: "Region is not available!" });
        }

        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already used!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Dapatkan ID hero Alucard dan Layla
        const alucard = await Hero.findOne({ name: 'Alucard' });
        const layla = await Hero.findOne({ name: 'Layla' });

        if (!alucard || !layla) {
            return res.status(500).json({ message: "Default hero not found!" });
        }

        // Buat user baru
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            gender,
            region,
            role: role || "Player", // default ke Player jika tidak diset
            owned_heroes: [alucard._id, layla._id] // Tambahkan Alucard dan Layla
        });

        // Simpan ke database
        await newUser.save();

        res.status(201).json({ message: "Successfully registered user!", user: newUser });
    } catch (error) {
        console.error("Error registrating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cek apakah user dengan email tersebut ada
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Buat payload JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || "secret_key", // Simpan di .env
            { expiresIn: "1d" }
        );

        // Kirim token dalam response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//kurang logic diamond
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, region } = req.body;
        const profilePicture = req.file;

        // Cek apakah user mencoba mengupdate profile user lain
        if (req.user.id.toString() != id) {
            return res.status(403).json({ 
                message: "You are not allowed to update this profile" 
            });
        }

        // Validasi input
        if (!username && !region && !profilePicture) {
            return res.status(400).json({
                message: "Please provide at least one field to update (username, region, or profile picture)"
            });
        }

        // Ambil data user saat ini
        const currentUser = await User.findById(id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validasi dan proses update username
        if (username) {
            if (username !== currentUser.username) {
                // Cek diamond untuk ganti username
                if (currentUser.diamond < 239) {
                    return res.status(400).json({ 
                        message: "Diamond is not enough to change username. Required 239 diamonds." 
                    });
                }
                // Kurangi diamond
                currentUser.diamond -= 239;
            }
            else{
                return res.status(400).json({
                    message: "Username does not change, no need to update"
                });
            }
        }

        // Validasi dan proses update region
        if (region) {
            const regionValid = await isValidRegion(region);
            if (!regionValid) {
                return res.status(400).json({ message: "Region is not available!" });
            }

            if (region !== currentUser.region) {
                // Cek diamond untuk ganti region
                if (currentUser.diamond < 300) {
                    return res.status(400).json({ 
                        message: "Diamond is not enough to change region. Required 300 diamonds." 
                    });
                }
                // Kurangi diamond dan update waktu terakhir
                currentUser.diamond -= 300;
                currentUser.last_region_update = new Date();
            }
            else{
                return res.status(400).json({
                    message: "Region does not change, no need to update"
                });
            }
        }

        // Siapkan data update
        const updateData = {};
        if (username) updateData.username = username;
        if (region) updateData.region = region;
        if (profilePicture) {
            // Dapatkan username saat ini jika tidak ada username baru
            const usernameToUse = username || currentUser.username;
            
            // Hapus file profile picture lama jika ada
            if (currentUser.profile_picture) {
                try {
                    fs.unlinkSync(currentUser.profile_picture);
                } catch (error) {
                    console.log('Last profile picture not found, skipping deletion:', error);
                }
            }

            // Update path file dengan username
            const fileExt = path.extname(profilePicture.originalname);
            const newPath = `uploads/profile_pictures/profile-${usernameToUse}${fileExt}`;
            
            // Rename file
            fs.renameSync(profilePicture.path, newPath);
            updateData.profile_picture = newPath;
        }

        // Update diamond jika ada perubahan
        if (username !== currentUser.username || region !== currentUser.region) {
            updateData.diamond = currentUser.diamond;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: "Successfully updated profile",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getPlayerProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Validasi ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: "Invalid user ID format" 
            });
        }

        // Cari user berdasarkan ID
        const player = await User.findById(id)
            .select('username diamond battle_point experience level starlight owned_heroes owned_skins')
            .populate({
                path: 'owned_heroes',
                select: 'name role1 role2'
            })
            .populate({
                path: 'owned_skins',
                select: 'name skin_type',
                populate: {
                    path: 'id_hero',
                    select: 'name'
                }
            });

        if (!player) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hitung total hero dan skin
        const totalHeroes = player.owned_heroes.length;
        const totalSkins = player.owned_skins.length;

        // Hitung XP untuk level berikutnya
        const xpForNextLevel = player.level * 1000; // Contoh: level 1 butuh 1000 XP, level 2 butuh 2000 XP, dst
        const xpProgress = player.experience % xpForNextLevel;
        const xpPercentage = Math.floor((xpProgress / xpForNextLevel) * 100);

        // Format response
        const response = {
            username: player.username,
            diamond: player.diamond,
            battle_point: player.battle_point,
            experience: {
                current: player.experience,
                level: player.level,
                next_level: player.level + 1,
                xp_for_next_level: xpForNextLevel,
                current_xp: xpProgress,
                percentage: xpPercentage
            },
            starlight_status: player.starlight,
            heroes: {
                total: totalHeroes,
                list: player.owned_heroes
            },
            skins: {
                total: totalSkins,
                list: player.owned_skins
            }
        };

        res.json({
            message: "Successfully fetched player profile",
            data: response
        });
    } catch (error) {
        console.error("Error getPlayerProfile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Fungsi untuk mendapatkan random hero dari owned heroes
async function getRandomHero(ownedHeroes) {
    const randomIndex = Math.floor(Math.random() * ownedHeroes.length);
    return ownedHeroes[randomIndex];
}


exports.play = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId).populate('owned_heroes');

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.owned_heroes.length === 0) {
            return res.status(400).json({ message: "You don't have any hero yet!" });
        }

        // Dapatkan semua user yang tersedia (exclude current user)
        const allPlayers = await User.find({
            _id: { $ne: userId },
            owned_heroes: { $exists: true, $ne: [] }
        })
        .select('username owned_heroes starlight'); // Tambahkan starlight

        if (allPlayers.length < 9) {
            return res.status(400).json({ message: "Not enough player to start the game!" });
        }

        // Acak urutan player
        const shuffledPlayers = allPlayers.sort(() => Math.random() - 0.5);

        // Random team untuk current user
        const currentUserTeam = Math.random() < 0.5 ? 'A' : 'B';
        const opponentTeam = currentUserTeam === 'A' ? 'B' : 'A';

        let teamAPlayers = [];
        let teamBPlayers = [];

        // Bagi menjadi 2 tim berdasarkan tim random current user
        if (currentUserTeam === 'A') {
            teamAPlayers = shuffledPlayers.slice(0, 4); // 4 player + current user = 5
            teamBPlayers = shuffledPlayers.slice(4, 9); // 5 player
        } else {
            teamBPlayers = shuffledPlayers.slice(0, 4); // 4 player + current user = 5
            teamAPlayers = shuffledPlayers.slice(4, 9); // 5 player
        }

        const matchPlayers = [];

        // Hero untuk current user
        const currentUserHero = await getRandomHero(currentUser.owned_heroes);
        matchPlayers.push({
            user: userId,
            hero: currentUserHero,
            team: currentUserTeam,
            starlight: currentUser.starlight, // Simpan status starlight
            battle_point_earned: 0,
            experience_earned: 0
        });

        // Fungsi untuk menambahkan player ke match
        const addPlayersToMatch = async (players, team) => {
            for (const player of players) {
                const hero = await getRandomHero(player.owned_heroes);
                matchPlayers.push({
                    user: player._id,
                    hero: hero,
                    team: team,
                    starlight: player.starlight, // Simpan status starlight
                    battle_point_earned: 0,
                    experience_earned: 0
                });
            }
        };

        // Tambahkan player ke team A dan team B
        await addPlayersToMatch(teamAPlayers, 'A');
        await addPlayersToMatch(teamBPlayers, 'B');

        // Random pilih pemenang
        const winnerTeam = Math.random() < 0.5 ? 'A' : 'B';

        // Fungsi untuk mendapatkan random number dalam range
        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // Set battle point dan experience berdasarkan menang/kalah dan status starlight
        matchPlayers.forEach(player => {
            const isWinner = player.team === winnerTeam;
            const hasStarlight = player.starlight;

            if (isWinner) {
                if (hasStarlight) {
                    // Range untuk menang dengan Starlight: BP 150-200, XP 250-350
                    player.battle_point_earned = getRandomNumber(150, 200);
                    player.experience_earned = getRandomNumber(250, 350);
                } else {
                    // Range untuk menang tanpa Starlight: BP 80-120, XP 150-250
                    player.battle_point_earned = getRandomNumber(80, 120);
                    player.experience_earned = getRandomNumber(150, 250);
                }
            } else {
                if (hasStarlight) {
                    // Range untuk kalah dengan Starlight: BP 60-90, XP 100-150
                    player.battle_point_earned = getRandomNumber(60, 90);
                    player.experience_earned = getRandomNumber(100, 150);
                } else {
                    // Range untuk kalah tanpa Starlight: BP 30-50, XP 50-100
                    player.battle_point_earned = getRandomNumber(30, 50);
                    player.experience_earned = getRandomNumber(50, 100);
                }
            }
        });

        // Simpan match ke database
        const match = new Match({
            players: matchPlayers,
            winner_team: winnerTeam
        });
        await match.save();

        // Update battle point, experience, dan level untuk semua pemain
        for (const player of matchPlayers) {
            const user = await User.findById(player.user);
            const newExperience = user.experience + player.experience_earned;
            const newLevel = Math.floor(newExperience / 1000) + 1;

            await User.findByIdAndUpdate(player.user, {
                $inc: {
                    battle_point: player.battle_point_earned,
                    experience: player.experience_earned
                },
                $set: {
                    level: newLevel
                }
            });
        }

        // Ambil data match yang sudah disimpan dengan populate
        const populatedMatch = await Match.findById(match._id)
            .populate({
                path: 'players.user',
                select: 'username'
            })
            .populate({
                path: 'players.hero',
                select: 'name'
            });

        // Format response untuk current user
        const currentUserMatchData = populatedMatch.players.find(p => p.user._id.toString() === userId);
        
        // Buat daftar player untuk setiap tim
        const teamAData = populatedMatch.players
            .filter(p => p.team === 'A')
            .map(p => ({
                username: p.user.username,
                hero: p.hero.name
            }));
            
        const teamBData = populatedMatch.players
            .filter(p => p.team === 'B')
            .map(p => ({
                username: p.user.username,
                hero: p.hero.name
            }));

        // Hitung XP untuk level berikutnya
        const updatedUser = await User.findById(userId);
        const xpForNextLevel = updatedUser.level * 1000;

        res.json({
            message: "Game played successfully",
            result: {
                status: currentUserMatchData.team === winnerTeam ? "WIN" : "LOSE",
                battle_point_earned: currentUserMatchData.battle_point_earned,
                experience: {
                    earned: currentUserMatchData.experience_earned,
                    current_xp: updatedUser.experience,
                    level: updatedUser.level,
                    next_level: updatedUser.level + 1,
                    xp_for_next_level: xpForNextLevel,
                },
                players: {
                    team_a: teamAData,
                    team_b: teamBData
                }
            }
        });

    } catch (error) {
        console.error("Error during play:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.softDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ message: "User has been deleted before!" });
    }

    if(req.user.role === "Player") {
        if(req.user.id.toString() !== id) {
            return res.status(403).json({ message: "You don't have any access to delete this user!" });
        }
        else{
            user.isDeleted = true;
            user.deletedAt = new Date();
            await user.save();
        }
    }
    else if(req.user.role === "Admin") {
        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();
    }
    else {
        return res.status(403).json({ message: "Only admin or himself can delete the account!" });
    }
    
    res.json({
      message: "Successfully deleted user",
      user: {
        id: user._id,
        username: user.username,
        deletedAt: user.deletedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};
exports.getHeroes = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allHeroes = await Hero.find();

    const ownedHeroIds = user.owned_heroes.map(id => id.toString());

    const result = allHeroes.map(hero => ({
      _id: hero._id,
      name: hero.name,
      role1: hero.role1,
      role2: hero.role2,
      image: hero.image,
      status: ownedHeroIds.includes(hero._id.toString()) ? "owned" : "not owned"
    }));

    res.json({
      message: "Successfully fetched heroes",
      count: result.length,
      heroes: result
    });
  } catch (error) {
    console.error("Error getHeroes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getSkins = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "owned_skins",
      populate: { path: "id_hero", select: "name" }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const allSkins = await mongoose.model("Skin").find().populate("id_hero", "name");

    const ownedSkinIds = user.owned_skins.map(skin => skin._id.toString());

    const result = allSkins.map(skin => ({
      _id: skin._id,
      name: skin.name,
      skin_type: skin.skin_type,
      hero_name: skin.id_hero.name,
      status: ownedSkinIds.includes(skin._id.toString()) ? "owned" : "not owned"
    }));

    res.json({
      message: "Successfully fetched skins",
      count: result.length,
      skins: result
    });
  } catch (error) {
    console.error("Error getSkins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};