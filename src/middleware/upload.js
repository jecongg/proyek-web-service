const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile_pictures/');
    },
    filename: function (req, file, cb) {
        // Ambil username dari request body
        const username = req.body.username || 'default';
        // Buat nama file dengan format profile-username.jpg
        cb(null, `profile-${username}${path.extname(file.originalname)}`);
    }
});

const diskStorageHero = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/heroes/';
        // Buat direktori jika belum ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const heroName = req.body.name || `hero-${Date.now()}`;
        const sanitizedName = heroName.trim().replace(/\s+/g, '-');
        cb(null, `heroes-${sanitizedName}${path.extname(file.originalname)}`);
    }
});

const diskStorageSkin = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/skins/';
        // Buat direktori jika belum ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const skinName = req.body.name || `skin-${Date.now()}`;
        const sanitizedName = skinName.trim().replace(/\s+/g, '-');
        cb(null, `skins-${sanitizedName}${path.extname(file.originalname)}`);
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

// Konfigurasi upload
const uploadProfilePicture = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batasi ukuran file 5MB
        files: 1 // Batasi hanya 1 file
    }
}).single('profile_picture');


const uploadHeroImage = multer({
    storage: diskStorageHero,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Hanya 1 file
    }
}).single('image_hero');

const uploadSkinImage = multer({
    storage: diskStorageSkin,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Hanya 1 file
    }
}).single('image_skin');

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
    next(err);
};

module.exports = {
    uploadProfilePicture,
    handleMulterError,
    uploadHeroImage,
    uploadSkinImage
};
