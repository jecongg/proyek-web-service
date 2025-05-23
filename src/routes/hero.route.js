const express = require("express");
const router = express.Router();
const heroController = require("../controller/hero.controller");

router.put("/:id_hero", heroController.updateHargaHero);

module.exports = router;