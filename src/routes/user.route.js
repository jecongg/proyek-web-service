const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const { upload, handleMulterError } = require("../middleware/upload");
const authJwt = require("../middleware/authJwt");

router.get("/:username", userController.getUserByUsername);
router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/update/:id", [authJwt.verifyToken], upload, handleMulterError, userController.updateProfile);
router.get("/profile/:id", [authJwt.verifyToken], userController.getPlayerProfile);
router.post("/play", [authJwt.verifyToken], userController.play);
router.delete("/:id", userController.softDeleteUser);

module.exports = router;
