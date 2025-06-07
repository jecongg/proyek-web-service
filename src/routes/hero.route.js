const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");
const { uploadHeroImage, handleMulterError } = require("../middleware/upload");

router.put("/:id_hero", heroController.updateHargaHero);
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], heroController.createHero);
router.get("/", heroController.getAllHeroes);

// Create new hero (Admin only)
router.post("/", [authJwt.verifyToken, authJwt.isAdmin, uploadHeroImage, handleMulterError], heroController.createHero);

// Get hero by ID
// router.get("/:id", heroController.getHeroById);

// Update hero (Admin only)
router.put("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], heroController.updateHargaHero);

// Delete hero (Admin only)
// router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], heroController.delete);

module.exports = router;