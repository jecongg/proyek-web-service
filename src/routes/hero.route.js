const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");

router.put("/:id_hero", heroController.updateHargaHero);
router.post("/", [authJwt.verifyToken], heroController.createHero);

module.exports = router;