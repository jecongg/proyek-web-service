const express = require("express");
const router = express.Router();
const skinController = require("../controllers/skin.controller");

router.get("/", skinController.getAllSkins);
router.put("/:id_skin", skinController.updateHargaSkin);
router.post("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], skinController.createSkinForHero);

module.exports = router;