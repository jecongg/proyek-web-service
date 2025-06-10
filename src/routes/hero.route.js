const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");
const { uploadHeroImage, handleMulterError } = require("../middleware/upload");

router.get("/", [authJwt.verifyToken], heroController.getAllHeroes);
// Create new hero (Admin only)
router.post("/", [authJwt.verifyToken, authJwt.isAdmin, uploadHeroImage, handleMulterError], heroController.createHero);
// Update hero (Admin only)
router.put("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], heroController.updateHargaHero);

module.exports = router;