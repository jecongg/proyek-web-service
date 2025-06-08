const Hero = require("../models/Hero");
const path = require("path");
const User = require("../models/User");


exports.updateHargaHero = async (req, res) => {
    const { id_hero } = req.params;
    const { diamond_price, battle_point_price } = req.body;

    try {
        // Parsing ke number jika field ada
        const parsedDiamondPrice = typeof diamond_price !== "undefined"
            ? parseFloat(diamond_price)
            : undefined;

        const parsedBattlePointPrice = typeof battle_point_price !== "undefined"
            ? parseFloat(battle_point_price)
            : undefined;

        // Validasi minimal satu field harus ada
        if (
            typeof parsedDiamondPrice === "undefined" &&
            typeof parsedBattlePointPrice === "undefined"
        ) {
            return res.status(400).json({
                message: "Minimal satu field harus diisi: diamond_price atau battle_point_price",
            });
        }

        // Validasi diamond_price
        if (typeof parsedDiamondPrice !== "undefined") {
            if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
                return res.status(400).json({
                    message: "diamond_price harus berupa angka positif",
                });
            }
        }

        // Validasi battle_point_price
        if (typeof parsedBattlePointPrice !== "undefined") {
            if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
                return res.status(400).json({
                    message: "battle_point_price harus berupa angka positif",
                });
            }
        }

        // Buat object update
        const updateFields = {};
        if (typeof parsedDiamondPrice !== "undefined") {
            updateFields.diamond_price = parsedDiamondPrice;
        }
        if (typeof parsedBattlePointPrice !== "undefined") {
            updateFields.battle_point_price = parsedBattlePointPrice;
        }

        // Update hero
        const updatedHero = await Hero.findByIdAndUpdate(
            id_hero,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedHero) {
            return res.status(404).json({ message: "Hero tidak ditemukan" });
        }

        res.json({
            message: "Harga hero berhasil diupdate",
            hero: updatedHero,
        });

    } catch (error) {
        console.error("Error updating harga hero:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createHero = async (req, res) => {
    const { name, diamond_price, battle_point_price, role1, role2 } = req.body;
    const image_hero = req.file;

    if(!name || name.trim() === "") {
        return res.status(400).json({
            message: "Field name wajib diisi",
        });
    }

    if(!diamond_price || isNaN(diamond_price)) {
        return res.status(400).json({
            message: "Field diamond_price wajib diisi dan harus berupa angka",
        });
    }

    if(!battle_point_price || isNaN(battle_point_price)) {
        return res.status(400).json({
            message: "Field battle_point_price wajib diisi dan harus berupa angka",
        });
    }

    if(!role1 && !role2) {
        return res.status(400).json({
            message: "Field role1 dan role2 wajib diisi",
        });
    }
    
    if(!image_hero) {
        return res.status(400).json({
            message: "Field image_hero wajib diisi",
        });
    }

    const parsedDiamondPrice = parseFloat(diamond_price);
    const parsedBattlePointPrice = parseFloat(battle_point_price);

    if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
        return res.status(400).json({ message: "diamond_price harus berupa angka positif" });
    }

    if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
        return res.status(400).json({ message: "battle_point_price harus berupa angka positif" });
    }

    try {
        const existingHero = await Hero.findOne({ name: name.trim() });
        if (existingHero) {
            return res.status(409).json({ message: "Hero dengan nama tersebut sudah ada" });
        }

        const fileExt = path.extname(image_hero.originalname).toLowerCase();
        const newPath = `uploads/heroes/heroes-${name}${fileExt}`;

        const newHero = new Hero({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            battle_point_price: parsedBattlePointPrice,
            role1,
            role2,
            image_hero: newPath
        });

        const savedHero = await newHero.save();

        res.status(201).json({
            message: "Hero berhasil ditambahkan ke shop",
            hero: savedHero,
        });
    } catch (error) {
        console.error("Error creating hero:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllHeroes = async (req, res) => {
    try {
        const heroes = await Hero.find();
        
        if (req.user.role === "Admin") {
            const heroesWithOwnedStatus = heroes.map(hero => ({
                ...hero.toObject(),
                is_owned: true
            }));
            return res.json({
                message: "Success fetch heroes!",
                count_skin: heroesWithOwnedStatus.length,
                skins: heroesWithOwnedStatus
            });
        }
        
        const user = await User.findById(req.user.id).populate('owned_heroes');
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        const ownedHeroIds = user.owned_heroes.map(hero=> hero._id.toString());

        const heroesWithOwnedStatus = heroes.map(hero => ({
            ...hero.toObject(),
            is_owned: ownedHeroIds.includes(hero._id.toString())
        }));

        res.json({
            message: "Success fetch heroes!",
            count_skin: heroesWithOwnedStatus.length,
            skins: heroesWithOwnedStatus
        });
    } catch (error) {
        console.error("Error getAllSkins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateHero = async (req, res) => {
    try {
        const { name, diamond_price, battle_point_price, role1, role2 } = req.body;
        const updateFields = {};

        if (name) updateFields.name = name.trim();
        if (diamond_price !== undefined) {
            const parsedDiamondPrice = parseFloat(diamond_price);
            if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
                return res.status(400).json({ message: "diamond_price harus berupa angka positif" });
            }
            updateFields.diamond_price = parsedDiamondPrice;
        }
        if (battle_point_price !== undefined) {
            const parsedBattlePointPrice = parseFloat(battle_point_price);
            if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
                return res.status(400).json({ message: "battle_point_price harus berupa angka positif" });
            }
            updateFields.battle_point_price = parsedBattlePointPrice;
        }
        if (role1) updateFields.role1 = role1;
        if (role2) updateFields.role2 = role2;

        const updatedHero = await Hero.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedHero) {
            return res.status(404).json({ message: "Hero tidak ditemukan" });
        }

        res.json({
            message: "Hero berhasil diupdate",
            hero: updatedHero
        });
    } catch (error) {
        console.error("Error updateHero:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteHero = async (req, res) => {
    try {
        const deletedHero = await Hero.findByIdAndDelete(req.params.id);
        
        if (!deletedHero) {
            return res.status(404).json({ message: "Hero tidak ditemukan" });
        }

        res.json({
            message: "Hero berhasil dihapus",
            hero: deletedHero
        });
    } catch (error) {
        console.error("Error deleteHero:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
