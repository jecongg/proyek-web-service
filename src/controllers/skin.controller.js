const Skin = require("../models/Skin");
const User = require("../models/User");
const Hero = require("../models/Hero");
const path = require("path");

exports.getAllSkins = async (req, res) => {
    try {
        const skins = await Skin.find().populate('id_hero');
        
        if (req.user.role === "Admin") {
            const skinsWithOwnedStatus = skins.map(skin => ({
                ...skin.toObject(),
                is_owned: true
            }));
            return res.json({
                message: "Successfully fetched skins!",
                count_skin: skinsWithOwnedStatus.length,
                skins: skinsWithOwnedStatus
            });
        }
        
        const user = await User.findById(req.user.id).populate('owned_skins');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const ownedSkinIds = user.owned_skins.map(skin => skin._id.toString());

        const skinsWithOwnedStatus = skins.map(skin => ({
            ...skin.toObject(),
            is_owned: ownedSkinIds.includes(skin._id.toString())
        }));

        res.json({
            message: "Successfully fetched skins!",
            count_skin: skinsWithOwnedStatus.length,
            skins: skinsWithOwnedStatus
        });
    } catch (error) {
        console.error("Error getAllSkins:", error);
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
                message: "Diamond price is required!",
            });
        }

        // Parsing diamond_price ke number
        const parsedDiamondPrice = parseFloat(diamond_price);

        // Validasi diamond_price harus angka positif
        if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
            return res.status(400).json({
                message: "Diamond price must be a positive number",
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
            return res.status(404).json({ message: "Skin not found" });
        }

        // Jika berhasil, kirim respons sukses
        res.json({
            message: "Skin price updated successfully",
            skin: updatedSkin,
        });

    } catch (error) {
        // Tangani error internal server
        console.error("Error updating harga skin:", error);
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
            message: "Name and diamond price are required!",
        });
    }

    const parsedDiamondPrice = parseFloat(diamond_price);
    if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
        return res.status(400).json({
            message: "Diamond price must be a positive number",
        });
    }

    const allowedTypes = ["Basic", "Elite", "Special", "Epic", "Legend", "Starlight"];
    if (skin_type && !allowedTypes.includes(skin_type)) {
        return res.status(400).json({ message: `Skin type must be on of these: ${allowedTypes.join(", ")}` });
    }

    let processedIsBuyable;
    if (typeof isBuyableInput === 'string') {
        processedIsBuyable = isBuyableInput.toLowerCase() === 'true';
    } else if (typeof isBuyableInput === 'boolean') {
        processedIsBuyable = isBuyableInput;
    } else {
        processedIsBuyable = true;
    }

    if (skin_type === "Starlight") {
        processedIsBuyable = false;
    }

    if(!image_skin && !req.file) {
        return res.status(400).json({ message: "Skin image is required!" });
    }

    try {
        const hero = await Hero.findById(id_hero);
        if (!hero) {
            return res.status(404).json({ message: "Hero not found" });
        }

        const globallyExistingSkin = await Skin.findOne({ name: name.trim() });
        if (globallyExistingSkin) {
            return res.status(409).json({ message: "Skin has already existed" });
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
            message: "Skin created successfully",
            hero_name: hero.name,
            skin : {
                name: savedSkin.name,
                diamond_price: savedSkin.diamond_price,
                skin_type: savedSkin.skin_type,
                isBuyable: savedSkin.isBuyable,
                image_skin: savedSkin.image_skin
            }
        });

    } catch (error) {
        console.error("Error creating skin:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
