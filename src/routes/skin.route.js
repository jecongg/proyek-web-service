const express = require("express");
const router = express.Router();
const skinController = require("../controller/skin.controller");

router.get("/", skinController.getAllSkins);

module.exports = router;