const express = require("express");
const router = express.Router();
const authJwt = require("../middleware/authJwt");
const skinController = require("../controllers/skin.controller");
const { uploadImage } = require("../middleware/upload");

router.get("/", [authJwt.verifyToken], skinController.getAllSkins);
router.put("/:id_skin", [authJwt.verifyToken, authJwt.isAdmin], skinController.updateHargaSkin);
router.post("/hero/:id_hero", [authJwt.verifyToken, authJwt.isAdmin, uploadImage.single('image')], skinController.createSkinForHero);
router.get("/:id", [authJwt.verifyToken], skinController.getSkinById);
router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], skinController.deleteSkin);

module.exports = router;