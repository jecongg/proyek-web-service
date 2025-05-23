const User = require("../models/User");
require("../models/Hero");
require("../models/Skin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

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
exports.register = async (req, res) => {
    const { username, password, email, gender, region, role } = req.body;

    try {
        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            gender,
            region,
            role: role || "Player", // default ke Player jika tidak diset
        });

        // Simpan ke database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
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