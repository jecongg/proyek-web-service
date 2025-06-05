const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");
const { uploadImage } = require("../middleware/upload");

// Get all heroes
router.get("/", heroController.getAllHeroes);

// Create new hero (Admin only)
router.post("/", [authJwt.verifyToken, authJwt.isAdmin, uploadImage.single('image')], heroController.createHero);

// Get hero by ID
router.get("/:id", heroController.getHeroById);

// Update hero (Admin only)
router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], heroController.updateHero);

// Delete hero (Admin only)
router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], heroController.deleteHero);

module.exports = router;