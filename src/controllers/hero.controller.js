const Hero = require("../models/Hero");
const { google } = require("googleapis");
const stream = require("stream");
const path = require("path");
const fs = require("fs");
const multer = require('multer');
const authJwt = require("../middleware/authJwt");
const User = require("../models/User");

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1XxpeRYeLhYFFpWd6raORectRDXw-K8ZE";
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, "your-service-account-key.json");

async function getDriveService() {
    try {
        if (!fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
            console.error("File Service Account Key tidak ditemukan di:", SERVICE_ACCOUNT_KEY_PATH);
            console.error("Pastikan 'your-service-account-key.json' ada dan path-nya benar.");
            console.error("Inisialisasi Google Drive dilewati.");
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_KEY_PATH,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const authClient = await auth.getClient();
        return google.drive({ version: "v3", auth: authClient });
    } catch (error) {
        console.error("Error saat inisialisasi layanan Google Drive:", error.message);
        console.error("Detail:", error);
        console.error("Pastikan service account key Anda valid dan memiliki izin Drive API.");
        return null;
    }
}

async function uploadImageToDrive(imageBuffer, fileName, mimeType, driveService) {
    if (!driveService) {
        console.warn("Layanan Google Drive tidak tersedia. Upload dilewati.");
        return null;
    }
    if (!imageBuffer || !mimeType) {
        console.warn("Tidak ada data gambar (buffer atau mimetype) untuk diupload. Upload dilewati.");
        return null;
    }

    try {
        const imageStream = new stream.PassThrough();
        imageStream.end(imageBuffer);

        const fileMetadata = {
            name: fileName,
            parents: [GOOGLE_DRIVE_FOLDER_ID],
        };

        const media = {
            mimeType: mimeType,
            body: imageStream,
        };

        console.log(`Mengunggah gambar '${fileName}' ke folder Google Drive ID '${GOOGLE_DRIVE_FOLDER_ID}'...`);
        const response = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id, webViewLink, webContentLink",
        });

        console.log("Gambar berhasil diunggah ke Drive. File ID:", response.data.id);
        return {
            id: response.data.id,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
        };
    } catch (error) {
        console.error("Error saat mengunggah gambar ke Google Drive:", error.message);
        if (error.response && error.response.data) {
             console.error("Detail Error Google Drive API:", error.response.data.error);
        } else if (error.errors) {
             console.error("Array Error Google Drive API:", error.errors);
        }
        return null;
    }
}

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
exports.getAllHeroes = async (req, res) => {
    try {
        const heroes = await Hero.find();
        
        // Jika user adalah admin, semua hero dianggap owned
        if (req.user.role === "Admin") {
            const heroesWithOwnedStatus = heroes.map(hero => ({
                ...hero.toObject(),
                is_owned: true
            }));
            return res.json({
                message: "Success fetch heroes!",
                count_hero: heroesWithOwnedStatus.length,
                heroes: heroesWithOwnedStatus
            });
        }

        // Jika user adalah player, cek hero yang dimiliki
        const user = await User.findById(req.user.id).populate('owned_heroes');
        const ownedHeroIds = user.owned_heroes.map(hero => hero._id.toString());

        const heroesWithOwnedStatus = heroes.map(hero => ({
            ...hero.toObject(),
            is_owned: ownedHeroIds.includes(hero._id.toString())
        }));

        res.json({
            message: "Success fetch heroes!",
            count_hero: heroesWithOwnedStatus.length,
            heroes: heroesWithOwnedStatus
        });
    } catch (error) {
        console.error("Error getAllHeroes:", error);
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

        let driveImageDetails = null;

        if (req.file) {
            const driveService = await getDriveService();
            if (driveService) {
                const imageBuffer = req.file.buffer;
                const originalFileName = req.file.originalname;
                const mimeType = req.file.mimetype;

                const safeName = name.trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
                const timestamp = Date.now();
                const uniqueFileName = `${safeName}_${timestamp}_${originalFileName}`;

                driveImageDetails = await uploadImageToDrive(
                    imageBuffer,
                    uniqueFileName,
                    mimeType,
                    driveService
                );
            } else {
                console.warn("Tidak dapat menginisialisasi layanan Drive. Gambar tidak akan diunggah.");
            }
        } else {
            console.log("Tidak ada file gambar yang diunggah oleh pengguna.");
        }

        const newHeroData = {
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            battle_point_price: parsedBattlePointPrice,
            role1: normalizedRole1,
            role2: normalizedRole2,
            heroImageUrl: null,
        };

        if (driveImageDetails && driveImageDetails.webViewLink) {
            newHeroData.heroImageUrl = driveImageDetails.webViewLink;
        }

        const newHero = new Hero(newHeroData);
        const savedHero = await newHero.save();

        res.status(201).json({
            message: "Hero berhasil ditambahkan ke shop",
            hero: savedHero,
            driveUploadStatus: driveImageDetails ? `Berhasil (ID: ${driveImageDetails.id})` : (req.file ? "Gagal atau Dilewati" : "Tidak ada file diunggah")
        });

    } catch (error) {
        console.error("Error saat membuat hero:", error);
        if (error.code === 'LIMIT_FILE_SIZE' || error instanceof multer.MulterError) {
             return res.status(400).json({ message: "Error file upload: " + error.message });
        }
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
