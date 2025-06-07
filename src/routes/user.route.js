const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { uploadProfilePicture, handleMulterError } = require("../middleware/upload");
const authJwt = require("../middleware/authJwt");

router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/update/:id", [authJwt.verifyToken], uploadProfilePicture, handleMulterError, userController.updateProfile);
router.get("/profile/:id", [authJwt.verifyToken], userController.getPlayerProfile);
router.post("/play", [authJwt.verifyToken], userController.play);
router.delete("/:id", userController.softDeleteUser);
router.get("/heroes",[authJwt.verifyToken], userController.getHeroes);
router.get("/skins", [authJwt.verifyToken], userController.getSkins);
router.get("/:username", userController.getUserByUsername);

module.exports = router;
