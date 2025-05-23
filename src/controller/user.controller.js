const User = require("../models/User");
require("../models/Hero");
require("../models/Skin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userValidation = require("../validation/user.validation");
const axios = require("axios");

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

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, region } = req.body;
        const profilePicture = req.file;

        // Cek apakah user mencoba mengupdate profile mereka sendiri
        if (req.user._id.toString() !== id) {
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
            updateData.profile_picture = profilePicture.path;
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