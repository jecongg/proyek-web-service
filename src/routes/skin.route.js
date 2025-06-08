const express = require("express");
const router = express.Router();
const skinController = require("../controllers/skin.controller");
const authJwt = require("../middleware/authJwt");

router.get("/", skinController.getAllSkins);
router.put("/:id_skin", [authJwt.verifyToken, authJwt.isAdmin], skinController.updateHargaSkin);
router.post("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], skinController.createSkinForHero);

module.exports = router;