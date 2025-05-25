const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const { upload, handleMulterError } = require("../middleware/upload");
const auth = require("../middleware/auth");

router.get("/:username", userController.getUserByUsername);
router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/update/:id", auth, upload, handleMulterError, userController.updateProfile);
router.get("/profile/:id", auth, userController.getPlayerProfile);

module.exports = router;
