const Skin = require("../models/Skin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.getAllSkins = async (req, res) => {
    try {
        const token = req.headers["x-auth-token"];

        let skins = await Skin.find().populate("id_hero", "name"); // populate hero name jika perlu

        if (token) {
            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
            const userId = decoded.id;

            // Cari user dan ambil owned_skins
            const user = await User.findById(userId).select("owned_skins");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Ubah owned_skins jadi Set untuk pengecekan cepat
            const ownedSkinIds = new Set(user.owned_skins.map(id => id.toString()));

            // Tambahkan properti "owned" ke masing-masing skin
            skins = skins.map(skin => {
                const isOwned = ownedSkinIds.has(skin._id.toString());
                return {
                    ...skin._doc,
                    owned: isOwned,
                };
            });
        }

        res.json(skins);
    } catch (error) {
        console.error("Error fetching skins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};