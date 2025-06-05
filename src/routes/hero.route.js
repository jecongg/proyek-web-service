const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file gambar yang diizinkan! Pastikan format file Anda adalah gambar (contoh: JPEG, PNG)."), false);
        }
    }
});

router.put("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], heroController.updateHargaHero);
router.post("/",[authJwt.verifyToken, authJwt.isAdmin, upload.single('heroImageFile')],heroController.createHero);
router.get("/", [authJwt.verifyToken], heroController.getAllHeroes);


module.exports = router;