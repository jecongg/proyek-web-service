const Skin = require("../models/Skin");
const User = require("../models/User");
const Hero = require("../models/Hero");
const path = require("path");

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

exports.updateHargaSkin = async (req, res) => {
    // Mengambil id_skin dari parameter URL
    const { id_skin } = req.params; 
    // Mengambil diamond_price dari body request
    const { diamond_price } = req.body;

    try {
        // Memastikan diamond_price ada di body
        if (typeof diamond_price === "undefined") {
            return res.status(400).json({
                message: "Field diamond_price harus diisi",
            });
        }

        // Parsing diamond_price ke number
        const parsedDiamondPrice = parseFloat(diamond_price);

        // Validasi diamond_price harus angka positif
        if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
            return res.status(400).json({
                message: "diamond_price harus berupa angka positif",
            });
        }

        // Membuat objek update hanya dengan diamond_price
        const updateFields = {
            diamond_price: parsedDiamondPrice,
        };

        // Mencari dan mengupdate skin berdasarkan id_skin
        const updatedSkin = await Skin.findByIdAndUpdate(
            id_skin, // ID skin yang akan diupdate
            updateFields, // Data yang akan diupdate
            { new: true, runValidators: true } // Opsi: kembalikan data baru & jalankan validator
        );

        // Jika skin tidak ditemukan
        if (!updatedSkin) {
            return res.status(404).json({ message: "Skin tidak ditemukan" });
        }

        // Jika berhasil, kirim respons sukses
        res.json({
            message: "Harga skin berhasil diupdate",
            skin: updatedSkin,
        });

    } catch (error) {
        // Tangani error internal server
        console.error("Error updating harga skin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllSkins = async (req, res) => {
    try {
        const skins = await Skin.find().populate('id_hero');
        
        if (req.user.role === "Admin") {
            const skinsWithOwnedStatus = skins.map(skin => ({
                ...skin.toObject(),
                is_owned: true
            }));
            return res.json({
                message: "Success fetch skins!",
                count_skin: skinsWithOwnedStatus.length,
                skins: skinsWithOwnedStatus
            });
        }
        
        const user = await User.findById(req.user.id).populate('owned_skins');
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        const ownedSkinIds = user.owned_skins.map(skin => skin._id.toString());

        const skinsWithOwnedStatus = skins.map(skin => ({
            ...skin.toObject(),
            is_owned: ownedSkinIds.includes(skin._id.toString())
        }));

        res.json({
            message: "Success fetch skins!",
            count_skin: skinsWithOwnedStatus.length,
            skins: skinsWithOwnedStatus
        });
    } catch (error) {
        console.error("Error getAllSkins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createSkinForHero = async (req, res) => {
    const { id_hero } = req.params;
    const { name, diamond_price, skin_type } = req.body;
    let isBuyableInput = req.body.isBuyable;
    const image_skin = req.file;

    if (!name || diamond_price === undefined) {
        return res.status(400).json({
            message: "Field name dan diamond_price wajib diisi",
        });
    }

    const parsedDiamondPrice = parseFloat(diamond_price);
    if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
        return res.status(400).json({
            message: "diamond_price harus berupa angka positif",
        });
    }

    const allowedTypes = ["Basic", "Elite", "Special", "Epic", "Legend"];
    if (skin_type && !allowedTypes.includes(skin_type)) {
        return res.status(400).json({ message: `skin_type harus salah satu dari: ${allowedTypes.join(", ")}` });
    }

    let processedIsBuyable;
    if (typeof isBuyableInput === 'string') {
        processedIsBuyable = isBuyableInput.toLowerCase() === 'true';
    } else if (typeof isBuyableInput === 'boolean') {
        processedIsBuyable = isBuyableInput;
    } else {
        processedIsBuyable = true;
    }

    if(!image_skin && !req.file) {
        return res.status(400).json({ message: "Gambar skin wajib diunggah" });
    }

    try {
        const hero = await Hero.findById(id_hero);
        if (!hero) {
            return res.status(404).json({ message: "Hero tidak ditemukan" });
        }

        const globallyExistingSkin = await Skin.findOne({ name: name.trim() });
        if (globallyExistingSkin) {
            return res.status(409).json({ message: "Skin sudah ada" });
        }

        const fileExt = path.extname(image_skin.originalname).toLowerCase();
        const newPath = `uploads/skins/skins-${name}${fileExt}`;

        const newSkin = new Skin({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            skin_type: skin_type || "Basic",
            id_hero,
            isBuyable: processedIsBuyable,
            image_skin: newPath
        });

        const savedSkin = await newSkin.save();

        res.status(201).json({
            message: "Skin berhasil ditambahkan ke hero",
            skin: savedSkin,
        });

    } catch (error) {
        console.error("Error creating skin:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validasi gagal", errors: error.errors });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getSkinById = async (req, res) => {
    try {
        const { id } = req.params;
        const skin = await Skin.findById(id).populate('id_hero');

        if (!skin) {
            return res.status(404).json({ message: "Skin tidak ditemukan" });
        }

        // Jika user adalah admin, skin dianggap owned
        if (req.user.role === "Admin") {
            return res.json({
                message: "Success fetch skin!",
                skin: {
                    ...skin.toObject(),
                    is_owned: true
                }
            });
        }

        // Jika user adalah player, cek apakah skin dimiliki
        const user = await User.findById(req.user.id).populate('owned_skins');
        const ownedSkinIds = user.owned_skins.map(s => s._id.toString());
        const isOwned = ownedSkinIds.includes(skin._id.toString());

        res.json({
            message: "Success fetch skin!",
            skin: {
                ...skin.toObject(),
                is_owned: isOwned
            }
        });
    } catch (error) {
        console.error("Error getSkinById:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteSkin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cari skin yang akan dihapus
        const skin = await Skin.findById(id);
        if (!skin) {
            return res.status(404).json({ message: "Skin tidak ditemukan" });
        }

        // Hapus skin
        await Skin.findByIdAndDelete(id);

        res.json({
            message: "Skin berhasil dihapus",
            deletedSkin: skin
        });
    } catch (error) {
        console.error("Error deleteSkin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

