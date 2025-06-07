const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authJwt = require("../middleware/authJwt");

router.post('/starlight', [authJwt.verifyToken], paymentController.buyStarlight);
router.post('/topup', [authJwt.verifyToken], paymentController.buyDiamond);
router.post('/webhook', express.json(), paymentController.midtransWebhook);

module.exports = router;
