const express = require("express");
const router = express.Router();
const skinController = require("../controller/skin.controller");
const authJwt = require("../middleware/authJwt");

router.get("/", skinController.getAllSkins);
router.post("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], skinController.createSkinForHero);

module.exports = router;