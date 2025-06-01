const Skin = require("../models/Skin");
const User = require("../models/User");
const Hero = require("../models/Hero");
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

exports.createSkinForHero = async (req, res) => {
    const { id_hero } = req.params;
    const { name, diamond_price, skin_type, isBuyable } = req.body;

    if (!name || diamond_price === undefined) {
        return res.status(400).json({
            message: "Field name dan diamond_price wajib diisi",
        });
    }

    const parsedDiamondPrice = parseFloat(diamond_price);
    if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
        return res.status(400).json({ message: "diamond_price harus berupa angka positif" });
    }

    const allowedTypes = ["Basic", "Elite", "Special", "Epic", "Legend", "Starlight"];
    if (skin_type && !allowedTypes.includes(skin_type)) {
        return res.status(400).json({ message: `skin_type harus salah satu dari: ${allowedTypes.join(", ")}` });
    }

    try {
        const hero = await Hero.findById(id_hero);
        if (!hero) {
            return res.status(404).json({ message: "Hero tidak ditemukan" });
        }

        const existingSkin = await Skin.findOne({ name: name.trim(), id_hero: id_hero });
        if (existingSkin) {
            return res.status(409).json({ message: "Skin dengan nama tersebut sudah ada untuk hero ini" });
        }

        const newSkin = new Skin({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            skin_type: skin_type || "Basic",
            id_hero,
            isBuyable: isBuyable !== undefined ? isBuyable : true
        });

        const savedSkin = await newSkin.save();

        res.status(201).json({
            message: "Skin berhasil ditambahkan ke hero",
            skin: savedSkin,
        });

    } catch (error) {
        console.error("Error creating skin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};