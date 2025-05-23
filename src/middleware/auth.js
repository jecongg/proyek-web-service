const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan' });
        }

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Cari user berdasarkan id dari token
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Token tidak valid' });
        }

        // Tambahkan user ke request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};

module.exports = auth; 