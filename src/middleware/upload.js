const multer = require('multer');
const path = require('path');
const fs = require("fs"); // Ditambahkan untuk membaca service account key


// Konfigurasi storage untuk memory storage (untuk hero dan skin)
const memoryStorage = multer.memoryStorage();

// Konfigurasi storage untuk disk storage (untuk profile picture)
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/profile_pictures/';
        // Buat direktori jika belum ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const username = req.body.username || 'default';
        cb(null, `profile-${username}${path.extname(file.originalname)}`);
    }
});

// Filter file untuk gambar
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Hanya file JPEG, JPG, dan PNG yang diizinkan!'), false);
    }
};

// Konfigurasi upload untuk hero dan skin (menggunakan memory storage)
const uploadImage = multer({
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Konfigurasi upload untuk profile picture (menggunakan disk storage)
const uploadProfilePicture = multer({
    storage: diskStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Hanya 1 file
    }
}).single('profile_picture');

// Middleware untuk menangani error multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Hanya bisa upload 1 file!' });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB!' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err.message) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
};

module.exports = {
    uploadImage,
    uploadProfilePicture,
    handleMulterError
};

const GOOGLE_DRIVE_FOLDER_ID = process.env.SKIN_GOOGLE_DRIVE_FOLDER_ID || "1XxpeRYeLhYFFpWd6raORectRDXw-K8ZE";
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, "../config/your-service-account-key.json"); 