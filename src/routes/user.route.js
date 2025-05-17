const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");

router.get("/:username", userController.getUserByUsername);
router.get("/", userController.getAllUsers);
router.post("/", userController.registerUser);

module.exports = router;
