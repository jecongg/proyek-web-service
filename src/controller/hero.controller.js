const Hero = require("../models/Hero");

exports.updateHargaHero = async (req, res) => {
    const { id_hero } = req.params;
    const { diamond_price, battle_point_price } = req.body;

    try {
        // Validasi minimal satu field harus ada
        if (
            typeof diamond_price === "undefined" &&
            typeof battle_point_price === "undefined"
        ) {
            return res.status(400).json({
                message: "Minimal satu field harus diisi: diamond_price atau battle_point_price",
            });
        }

        // Validasi jika ada field diamond_price
        if (typeof diamond_price !== "undefined") {
            if (typeof diamond_price !== "number" || diamond_price < 0) {
                return res.status(400).json({
                    message: "diamond_price harus berupa angka positif",
                });
            }
        }

        // Validasi jika ada field battle_point_price
        if (typeof battle_point_price !== "undefined") {
            if (typeof battle_point_price !== "number" || battle_point_price < 0) {
                return res.status(400).json({
                    message: "battle_point_price harus berupa angka positif",
                });
            }
        }

        // Buat object update hanya dengan field yang tersedia
        const updateFields = {};
        if (typeof diamond_price !== "undefined") {
            updateFields.diamond_price = diamond_price;
        }
        if (typeof battle_point_price !== "undefined") {
            updateFields.battle_point_price = battle_point_price;
        }

        // Update hero di database
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