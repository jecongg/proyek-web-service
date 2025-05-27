const express = require("express");
const router = express.Router();
const skinController = require("../controllers/skin.controller");

router.get("/", skinController.getAllSkins);

module.exports = router;