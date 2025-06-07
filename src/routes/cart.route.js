const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const authJwt = require("../middleware/authJwt");

router.post("/add", [authJwt.verifyToken, authJwt.isPlayer], cartController.addToCart);
router.get("/", [authJwt.verifyToken, authJwt.isPlayer], cartController.getCart);
router.delete("/remove", [authJwt.verifyToken, authJwt.isPlayer], cartController.removeFromCart);
router.post("/checkout", [authJwt.verifyToken, authJwt.isPlayer], cartController.checkoutAllItems);

module.exports = router;