const express = require("express");
const router = express.Router();
const heroController = require("../controller/hero.controller");
const authJwt = require("../middleware/authJwt");

router.put("/:id_hero", heroController.updateHargaHero);
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], heroController.createHero);

module.exports = router;