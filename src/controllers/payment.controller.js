const crypto = require('crypto');
const { createTransaction } = require("../services/midtrans.service");
const PaymentHistory = require("../models/PaymentHistory");
const User = require("../models/User");

function isSignatureValid(body) {
    const { order_id, status_code, gross_amount, signature_key } = body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const input = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto.createHash('sha512').update(input).digest('hex');

    return signature_key === expectedSignature;
}


exports.buyStarlight = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil data user dari database
        const user = await User.findById(userId);

        const amount = 150000;
        const orderId = `starlight-${userId}-${Date.now()}`;

        // console.log(req.user._id);
        // Hanya pakai email
        const customer = {
            email: user.email,
        };

        const transaction = await createTransaction(orderId, amount, customer);

        await PaymentHistory.create({
            user_id: userId,
            order_id: orderId,
            total: amount,
            payment_method: null, // akan diisi nanti lewat webhook
            type: "starlight",
            status: "pending", // default
        });

        res.status(200).json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });
    } catch (err) {
        console.error("Starlight payment error:", err);
        res.status(500).json({
            message: "Failed to initiate starlight purchase",
            err
        });
    }
};

exports.midtransWebhook = async (req, res) => {
    try {
        // Verifikasi signature
        if (!isSignatureValid(req.body)) {
            console.warn('❌ Invalid signature key from Midtrans');
            return res.status(403).send('Forbidden: Invalid signature');
        }

        const { order_id, transaction_status, payment_type } = req.body;

        console.log("✅ Webhook received:", req.body);

        if (transaction_status === "settlement") {
            const payment = await PaymentHistory.findOneAndUpdate(
                { order_id },
                {
                    status: "paid",
                    payment_method: payment_type,
                    updatedAt: new Date(),
                },
                { new: true }
            );

            if (payment && payment.type === "starlight") {
                await User.findByIdAndUpdate(payment.user_id, {
                    starlight: true,
                    updatedAt: new Date(),
                });
            }

            return res.status(200).send("OK");
        }

        res.status(200).send("Ignored: not settled");
    } catch (err) {
        console.error("Webhook error:", err);
        res.status(500).send("Internal Server Error");
    }
};
exports.buyDiamond = async (req, res) => {
    try {
        const userId = req.user.id;
        const { diamonds, amount } = req.body;

        if (!diamonds || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid diamonds or amount" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const orderId = `diamond-${userId}-${Date.now()}`;

        const customer = {
            email: user.email,
        };

        const transaction = await createTransaction(orderId, amount, customer);

        await PaymentHistory.create({
            user_id: userId,
            order_id: orderId,
            total: amount,
            payment_method: null,
            type: "diamond",
            diamond_amount: diamonds,
            status: "pending",
        });

        res.status(200).json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });
    } catch (err) {
        console.error("Diamond top-up error:", err);
        res.status(500).json({
            message: "Failed to initiate diamond top-up",
            err,
        });
    }
};
