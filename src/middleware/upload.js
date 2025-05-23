const multer = require('multer');
const path = require('path');

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

// Filter file
const fileFilter = (req, file, cb) => {
    // Hanya terima file JPEG, JPG, dan PNG
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Hanya file JPEG, JPG, dan PNG yang diizinkan!'), false);
    }
};

// Konfigurasi upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batasi ukuran file 5MB
        files: 1 // Batasi hanya 1 file
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
    next(err);
};

module.exports = { upload, handleMulterError }; 