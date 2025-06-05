const Skin = require("../models/Skin");
const User = require("../models/User");
const Hero = require("../models/Hero");
const { google } = require("googleapis"); // Ditambahkan untuk Google Drive
const stream = require("stream"); // Ditambahkan untuk upload stream
const path = require("path"); // Ditambahkan untuk path service account
const fs = require("fs"); // Ditambahkan untuk membaca service account key
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file gambar yang diizinkan!"), false);
        }
    }
});
exports.uploadMiddleware = upload;

const GOOGLE_DRIVE_FOLDER_ID = process.env.SKIN_GOOGLE_DRIVE_FOLDER_ID || "1XxpeRYeLhYFFpWd6raORectRDXw-K8ZE";
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, "../config/your-service-account-key.json");

async function getDriveService() {
    try {
        if (!fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
            console.error("File Service Account Key tidak ditemukan di:", SERVICE_ACCOUNT_KEY_PATH);
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
        console.log(`Mengunggah gambar skin '${fileName}' ke folder Google Drive ID '${GOOGLE_DRIVE_FOLDER_ID}'...`);
        const response = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id, webViewLink, webContentLink",
        });
        console.log("Gambar skin berhasil diunggah ke Drive. File ID:", response.data.id);
        return {
            id: response.data.id,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink,
        };
    } catch (error) {
        console.error("Error saat mengunggah gambar skin ke Google Drive:", error.message);
        if (error.response && error.response.data) {
             console.error("Detail Error Google Drive API:", error.response.data.error);
        } else if (error.errors) {
             console.error("Array Error Google Drive API:", error.errors);
        }
        return null;
    }
}
exports.getAllSkins = async (req, res) => {
    try {
        const skins = await Skin.find().populate('id_hero');
        
        // Jika user adalah admin, semua skin dianggap owned
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
        

        // Jika user adalah player, cek skin yang dimiliki
        const user = await User.findById(req.user.id).populate('owned_skins');
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

exports.updateHargaSkin = async (req, res) => {
    const { id_skin } = req.params; 
    const { diamond_price } = req.body;

    try {
        if (typeof diamond_price === "undefined") {
            return res.status(400).json({
                message: "Field diamond_price harus diisi",
            });
        }

        const parsedDiamondPrice = parseFloat(diamond_price);

        if (isNaN(parsedDiamondPrice) || parsedDiamondPrice < 0) {
            return res.status(400).json({
                message: "diamond_price harus berupa angka positif",
            });
        }

        const updateFields = {
            diamond_price: parsedDiamondPrice,
        };

        const updatedSkin = await Skin.findByIdAndUpdate(
            id_skin, 
            updateFields, 
            { new: true, runValidators: true } 
        );

        if (!updatedSkin) {
            return res.status(404).json({ message: "Skin tidak ditemukan" });
        }

        res.json({
            message: "Harga skin berhasil diupdate",
            skin: updatedSkin,
        });

    } catch (error) {
        console.error("Error updating harga skin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createSkinForHero = async (req, res) => {
    const { id_hero } = req.params;
    const { name, diamond_price, skin_type } = req.body;
    let isBuyableInput = req.body.isBuyable;

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

    let processedIsBuyable;
    if (typeof isBuyableInput === 'string') {
        processedIsBuyable = isBuyableInput.toLowerCase() === 'true';
    } else if (typeof isBuyableInput === 'boolean') {
        processedIsBuyable = isBuyableInput;
    } else {
        processedIsBuyable = true;
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

        let driveImageDetails = null;
        let skinImageUrl = null;

        if (req.file) {
            const driveService = await getDriveService();
            if (driveService) {
                const imageBuffer = req.file.buffer;
                const originalFileName = req.file.originalname;
                const mimeType = req.file.mimetype;

                const safeName = name.trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
                const timestamp = Date.now();
                const uniqueFileName = `skin_${safeName}_${timestamp}_${originalFileName}`;

                driveImageDetails = await uploadImageToDrive(
                    imageBuffer,
                    uniqueFileName,
                    mimeType,
                    driveService
                );
                if (driveImageDetails && driveImageDetails.webViewLink) {
                    skinImageUrl = driveImageDetails.webViewLink;
                }
            } else {
                console.warn("Layanan Google Drive tidak dapat diinisialisasi. Gambar skin tidak akan diunggah.");
            }
        } else {
            console.log("Tidak ada file gambar skin yang diunggah.");
        }

        const newSkin = new Skin({
            name: name.trim(),
            diamond_price: parsedDiamondPrice,
            skin_type: skin_type || "Basic",
            id_hero,
            isBuyable: processedIsBuyable,
            image_skin: skinImageUrl
        });

        const savedSkin = await newSkin.save();

        res.status(201).json({
            message: "Skin berhasil ditambahkan ke hero",
            skin: savedSkin,
            driveUploadStatus: driveImageDetails ? `Berhasil (ID: ${driveImageDetails.id})` : (req.file ? "Gagal atau Dilewati" : "Tidak ada file diunggah")
        });

    } catch (error) {
        console.error("Error creating skin:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validasi gagal", errors: error.errors });
        }
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer error: ${error.message}` });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

