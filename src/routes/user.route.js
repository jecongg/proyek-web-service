const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");

router.get("/:username", userController.getUserByUsername);
router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;
