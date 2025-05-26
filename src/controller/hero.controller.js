const Hero = require("../models/Hero");

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

    if (!name || diamond_price === undefined || battle_point_price === undefined) {
        return res.status(400).json({
            message: "Field name, diamond_price, dan battle_point_price wajib diisi",
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

        const newHero = new Hero({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            battle_point_price: parsedBattlePointPrice,
            role1,
            role2,
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
