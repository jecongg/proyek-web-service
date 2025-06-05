const express = require("express");
const router = express.Router();
const authJwt = require("../middleware/authJwt");
const skinController = require("../controllers/skin.controller");
const { uploadMiddleware } = require("../controllers/skin.controller");

router.get("/", [authJwt.verifyToken], skinController.getAllSkins);
router.put("/:id_skin", [authJwt.verifyToken, authJwt.isAdmin], skinController.updateHargaSkin);
router.post("/:id_hero",[authJwt.verifyToken, authJwt.isAdmin, uploadMiddleware.single('skinImageFile')], skinController.createSkinForHero);
 
module.exports = router;