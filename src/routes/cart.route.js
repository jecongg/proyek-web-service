const express = require("express");
const router = express.Router();

const cartController = require("../controller/cart.controller");
const authJwt = require("../middleware/authJwt");

router.post("/add", [authJwt.verifyToken], cartController.addToCart);
router.get("", [authJwt.verifyToken], cartController.getCart);
router.delete("/remove", [authJwt.verifyToken], cartController.removeFromCart);
router.post("/checkout", [authJwt.verifyToken], cartController.checkoutAllItems);

module.exports = router;