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
                message: "One of diamond_price or battle_point_price must be provided",
            });
        }

        // Validasi diamond_price
        if (typeof parsedDiamondPrice !== "undefined") {
            if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
                return res.status(400).json({
                    message: "Diamond price must be a positive number",
                });
            }
        }

        // Validasi battle_point_price
        if (typeof parsedBattlePointPrice !== "undefined") {
            if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
                return res.status(400).json({
                    message: "Battle point price must be a positive number",
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
            return res.status(404).json({ message: "Hero not found!" });
        }

        res.json({
            message: "Hero price updated successfully",
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
            message: "Name must be provided and cannot be empty!",
        });
    }

    if(!diamond_price || isNaN(diamond_price)) {
        return res.status(400).json({
            message: "Diamond price must be provided and must be a number",
        });
    }

    if(!battle_point_price || isNaN(battle_point_price)) {
        return res.status(400).json({
            message: "Battle point price must be provided and must be a number",
        });
    }

    if(!role1 && !role2) {
        return res.status(400).json({
            message: "Role1 or Role2 must be provided",
        });
    }
    
    if(!image_hero) {
        return res.status(400).json({
            message: "image_hero must be provided",
        });
    }

    const parsedDiamondPrice = parseFloat(diamond_price);
    const parsedBattlePointPrice = parseFloat(battle_point_price);

    if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
        return res.status(400).json({ message: "Diamond price must be a positive number" });
    }

    if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
        return res.status(400).json({ message: "Battle point price must be a positive number" });
    }

    try {
        const existingHero = await Hero.findOne({ name: name.trim() });
        if (existingHero) {
            return res.status(409).json({ message: "Hero's name has already existed" });
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
            message: "Successfully created hero",
            hero: {
                name: savedHero.name,
                diamond_price: savedHero.diamond_price,
                battle_point_price: savedHero.battle_point_price,
                role1: savedHero.role1,
                role2: savedHero.role2,
                image_hero: savedHero.image_hero
            }
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
                is_owned: true,
                isBuyable: false
            }));
            return res.json({
                message: "Successfully fetched heroes!",
                count_skin: heroesWithOwnedStatus.length,
                skins: heroesWithOwnedStatus
            });
        }
        
        const user = await User.findById(req.user.id).populate('owned_heroes');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const ownedHeroIds = user.owned_heroes.map(hero=> hero._id.toString());

        const heroesWithOwnedStatus = heroes.map(hero => ({
            ...hero.toObject(),
            is_owned: ownedHeroIds.includes(hero._id.toString())
        }));

        res.json({
            message: "Successfully fetched heroes!",
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
                return res.status(400).json({ message: "Diamond price must be a positive number" });
            }
            updateFields.diamond_price = parsedDiamondPrice;
        }
        if (battle_point_price !== undefined) {
            const parsedBattlePointPrice = parseFloat(battle_point_price);
            if (isNaN(parsedBattlePointPrice) || parsedBattlePointPrice < 0) {
                return res.status(400).json({ message: "Battle point price must be a positive number" });
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
            return res.status(404).json({ message: "Hero not found" });
        }

        res.json({
            message: "Successfully updated hero",
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
            return res.status(404).json({ message: "Hero not found" });
        }

        res.json({
            message: "Successfully deleted hero",
            hero: deletedHero
        });
    } catch (error) {
        console.error("Error deleteHero:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
