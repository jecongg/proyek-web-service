const express = require("express");
const router = express.Router();
const heroController = require("../controllers/hero.controller");
const authJwt = require("../middleware/authJwt");

router.put("/:id_hero", [authJwt.verifyToken, authJwt.isAdmin], heroController.updateHargaHero);
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], heroController.createHero);
router.get("/", heroController.getAllHeroes);


module.exports = router;