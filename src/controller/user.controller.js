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
            messages: "Success fetch user!",
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

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

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
            message: "Validasi gagal",
            errors: error.details.map((err) => err.message),
        });
    }

    const { username, password, email, gender, region, role } = req.body;

    try {
        //Cek region valid dari API negara
        const regionValid = await isValidRegion(region);
        if (!regionValid) {
            return res.status(400).json({ message: "Region tidak tersedia!" });
        }

        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Dapatkan ID hero Alucard dan Layla
        const alucard = await Hero.findOne({ name: 'Alucard' });
        const layla = await Hero.findOne({ name: 'Layla' });

        if (!alucard || !layla) {
            return res.status(500).json({ message: "Hero default tidak ditemukan" });
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

        res.status(201).json({ message: "Registrasi user berhasil!", user: newUser });
    } catch (error) {
        console.error("Error registrasi user:", error);
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

        // Cek apakah user mencoba mengupdate profile mereka sendiri
        if (req.user.id.toString() != id) {
            return res.status(403).json({ 
                message: "Anda tidak memiliki akses untuk mengupdate profile user lain" 
            });
        }

        // Validasi input
        if (!username && !region && !profilePicture) {
            return res.status(400).json({
                message: "Minimal satu field harus diisi: username, region, atau profile_picture"
            });
        }

        // Validasi region jika diisi
        if (region) {
            const regionValid = await isValidRegion(region);
            if (!regionValid) {
                return res.status(400).json({ message: "Region tidak tersedia!" });
            }
        }

        // Siapkan data update
        const updateData = {};
        if (username) updateData.username = username;
        if (region) updateData.region = region;
        if (profilePicture) {
            // Dapatkan username saat ini jika tidak ada username baru
            const currentUser = await User.findById(id);
            const usernameToUse = username || currentUser.username;
            
            // Hapus file profile picture lama jika ada
            if (currentUser.profile_picture) {
                try {
                    fs.unlinkSync(currentUser.profile_picture);
                } catch (error) {
                    console.log('File lama tidak ditemukan atau sudah dihapus');
                }
            }

            // Update path file dengan username
            const fileExt = path.extname(profilePicture.originalname);
            const newPath = `uploads/profile_pictures/profile-${usernameToUse}${fileExt}`;
            
            // Rename file
            fs.renameSync(profilePicture.path, newPath);
            updateData.profile_picture = newPath;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json({
            message: "Profile berhasil diupdate",
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
                message: "ID tidak valid. Mohon masukkan ID yang benar" 
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
            return res.status(404).json({ message: "Pemain tidak ditemukan" });
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
            message: "Berhasil mengambil data profil pemain",
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
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        if (currentUser.owned_heroes.length === 0) {
            return res.status(400).json({ message: "Anda belum memiliki hero" });
        }

        // Dapatkan semua user yang tersedia (exclude current user)
        const allPlayers = await User.find({ 
            _id: { $ne: userId },
            owned_heroes: { $exists: true, $ne: [] }
        })
        .select('username owned_heroes');

        if (allPlayers.length < 9) {
            return res.status(400).json({ message: "Tidak cukup pemain untuk memulai permainan" });
        }

        // Acak urutan player
        const shuffledPlayers = allPlayers.sort(() => Math.random() - 0.5);

        // Bagi menjadi 2 tim (5 untuk team A, 5 untuk team B)
        const teamAPlayers = shuffledPlayers.slice(0, 4); // 4 player + current user = 5
        const teamBPlayers = shuffledPlayers.slice(4, 9); // 5 player

        // Random pilih hero untuk setiap pemain
        const matchPlayers = [];
        
        // Hero untuk current user
        const currentUserHero = await getRandomHero(currentUser.owned_heroes);
        matchPlayers.push({
            user: userId,
            hero: currentUserHero,
            team: 'A',
            battle_point_earned: 0,
            experience_earned: 0
        });

        // Hero untuk team A players
        for (const player of teamAPlayers) {
            const hero = await getRandomHero(player.owned_heroes);
            matchPlayers.push({
                user: player._id,
                hero: hero,
                team: 'A',
                battle_point_earned: 0,
                experience_earned: 0
            });
        }

        // Hero untuk team B players
        for (const player of teamBPlayers) {
            const hero = await getRandomHero(player.owned_heroes);
            matchPlayers.push({
                user: player._id,
                hero: hero,
                team: 'B',
                battle_point_earned: 0,
                experience_earned: 0
            });
        }

        // Random pilih pemenang
        const winnerTeam = Math.random() < 0.5 ? 'A' : 'B';

        // Fungsi untuk mendapatkan random number dalam range
        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // Set battle point dan experience berdasarkan menang/kalah
        matchPlayers.forEach(player => {
            if (player.team === winnerTeam) {
                // Range untuk menang: BP 80-120, XP 150-250
                player.battle_point_earned = getRandomNumber(80, 120);
                player.experience_earned = getRandomNumber(150, 250);
            } else {
                // Range untuk kalah: BP 30-50, XP 50-100
                player.battle_point_earned = getRandomNumber(30, 50);
                player.experience_earned = getRandomNumber(50, 100);
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
        const teamPlayersData = populatedMatch.players.filter(p => p.team === 'A' && p.user._id.toString() !== userId);
        const enemyPlayersData = populatedMatch.players.filter(p => p.team === 'B');

        // Hitung XP untuk level berikutnya
        const updatedUser = await User.findById(userId);
        const xpForNextLevel = updatedUser.level * 1000;
        const xpProgress = updatedUser.experience % xpForNextLevel;

        res.json({
            message: "Permainan selesai",
            result: {
                status: currentUserMatchData.team === winnerTeam ? "Menang" : "Kalah",
                battle_point_earned: currentUserMatchData.battle_point_earned,
                experience: {
                    earned: currentUserMatchData.experience_earned,
                    current_xp: updatedUser.experience,
                    level: updatedUser.level,
                    next_level: updatedUser.level + 1,
                    xp_for_next_level: xpForNextLevel,
                },
                players: {
                    team_a: [
                        {
                            username: currentUser.username,
                            hero: currentUserMatchData.hero.name
                        },
                        ...teamPlayersData.map(p => ({
                            username: p.user.username,
                            hero: p.hero.name
                        }))
                    ],
                    team_b: enemyPlayersData.map(p => ({
                        username: p.user.username,
                        hero: p.hero.name
                    }))
                }
            }
        });

    } catch (error) {
        console.error("Error during play:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};