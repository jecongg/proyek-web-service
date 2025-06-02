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

exports.getAllHeroes = async (req, res) => {
    try {
        // Mengambil token dari header
        const token = req.headers["x-auth-token"];

        // Mengambil semua hero dari database
        let heroes = await Hero.find(); 

        // Jika ada token (user login)
        if (token) {
            try {
                // Verifikasi token untuk mendapatkan ID user
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
                const userId = decoded.id;

                // Cari user berdasarkan ID dan ambil hanya field 'owned_heroes'
                const user = await User.findById(userId).select("owned_heroes");

                // Jika user tidak ditemukan (mungkin token tidak valid/lama)
                if (!user) {
                    // Anda bisa memilih untuk mengembalikan error atau 
                    // mengembalikan semua hero tanpa status 'owned'
                    // Di sini kita kembalikan semua hero tanpa status 'owned'
                    console.warn("User not found for token, returning heroes without ownership status.");
                    return res.json(heroes);
                }

                // Ubah 'owned_heroes' menjadi Set untuk pengecekan yang efisien
                const ownedHeroIds = new Set(user.owned_heroes.map(id => id.toString()));

                // Tambahkan properti 'owned' ke setiap hero
                heroes = heroes.map(hero => {
                    const isOwned = ownedHeroIds.has(hero._id.toString());
                    return {
                        ...hero._doc, // Gunakan _doc untuk mendapatkan objek data murni Mongoose
                        owned: isOwned,
                    };
                });

            } catch (jwtError) {
                // Jika token tidak valid (error saat verify), 
                // kita anggap sebagai user non-login dan kembalikan hero tanpa status 'owned'.
                console.warn("Invalid token, returning heroes without ownership status:", jwtError.message);
                // Tetap kembalikan 'heroes' yang asli tanpa status 'owned'
            }
        }

        // Kembalikan daftar hero (dengan atau tanpa status 'owned')
        res.json(heroes);

    } catch (error) {
        // Tangani error internal server saat mengambil data hero
        console.error("Error fetching heroes:", error);
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

    const normalizedRole1 = role1 && role1.trim() !== "" ? role1.trim() : null;
    const normalizedRole2 = role2 && role2.trim() !== "" ? role2.trim() : null;

    try {
        const existingHero = await Hero.findOne({ name: name.trim() });
        if (existingHero) {
            return res.status(409).json({ message: "Hero dengan nama tersebut sudah ada" });
        }

        const newHero = new Hero({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            battle_point_price: parsedBattlePointPrice,
            role1: normalizedRole1,
            role2: normalizedRole2,
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
