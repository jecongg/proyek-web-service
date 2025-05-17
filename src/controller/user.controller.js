const User = require("../models/User");
require("../models/Hero");
require("../models/Skin");

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

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error getUserByUsername:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//Note: Belum selesai
exports.registerUser = async (req, res) => {
    try {
        const {  } = req.body;

        

        res.json(user);
    } catch (error) {
        console.error("Error register user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
