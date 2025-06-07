const express = require("express");
const router = express.Router();
const skinController = require("../controllers/skin.controller");
const { uploadSkinImage, handleMulterError } = require("../middleware/upload");
const authJwt = require("../middleware/authJwt");

router.get("/", [authJwt.verifyToken], skinController.getAllSkins);

router.put("/:id_skin", [authJwt.verifyToken, authJwt.isAdmin], skinController.updateHargaSkin);

router.post("/hero/:id_hero", [authJwt.verifyToken, authJwt.isAdmin, uploadSkinImage, handleMulterError], skinController.createSkinForHero);


module.exports = router;