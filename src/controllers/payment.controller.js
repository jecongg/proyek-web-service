const crypto = require('crypto');
const { createTransaction } = require("../services/midtrans.service");
const PaymentHistory = require("../models/PaymentHistory");
const User = require("../models/User");
const Skin = require('../models/Skin');

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

        if (user.starlight) {
            return res.status(400).json({ message: "You've already obtained Starlight Membership" });
        }

        if(user.role !== "Player") {
            return res.status(403).json({ message: "Forbidden: Only players can purchase Starlight Membership" });
        }

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
        // Verifikasi signature tetap penting
        if (!isSignatureValid(req.body)) {
            console.warn('Invalid signature key from Midtrans');
            return res.status(403).send('Forbidden: Invalid signature');
        }

        const { order_id, transaction_status, payment_type, transaction_id } = req.body;
        
        console.log(`Webhook received for order_id: ${order_id}, status: ${transaction_status}`);

        // SOLUSI: Terima 'capture' ATAU 'settlement' sebagai status berhasil
        if (transaction_status === "capture" || transaction_status === "settlement") {
            const payment = await PaymentHistory.findOneAndUpdate(
                { order_id },
                {
                    status: "paid", // Ubah status internal Anda menjadi 'paid'
                    payment_method: payment_type,
                    updatedAt: new Date(),
                },
                { new: true } // { new: true } mengembalikan dokumen yang sudah diperbarui
            );
            
            // Jika pembayaran tidak ditemukan atau sudah diproses, hentikan
            if (!payment) {
                 console.warn(`Payment with order_id: ${order_id} not found.`);
                 return res.status(404).send("Payment not found");
            }

            // Lakukan pembaruan berdasarkan tipe pembayaran
            if (payment.type === "starlight") {
                const starlightSkins = await Skin.find({ skin_type: "Starlight" }).select('_id');

                // 2. Ekstrak hanya _id dari setiap skin
                const skinIds = starlightSkins.map(skin => skin._id);

                // 3. Update status starlight user dan tambahkan semua skin Starlight ke owned_skins
                // Menggunakan $addToSet untuk menghindari penambahan skin yang mungkin sudah dimiliki
                await User.findByIdAndUpdate(payment.user_id, {
                    $set: { starlight: true },
                    $addToSet: { owned_skins: { $each: skinIds } }
                });

                console.log(`Starlight purchased for user: ${payment.user_id}`);
            } else if (payment.type === "topup") {
                await User.findByIdAndUpdate(payment.user_id, {
                    $inc: { diamond: payment.details.diamond_amount },
                });
                console.log(`${payment.details.diamond_amount} diamonds added for user: ${payment.user_id}`);
            }

            return res.status(200).send("OK: Transaction success processed.");
        }

        // Abaikan status lain yang tidak relevan (pending, deny, expire, dll)
        res.status(200).send("OK: Ignored, status not capture or settlement.");

    } catch (err) {
        console.error("Webhook error:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.buyDiamond = async (req, res) => {
    try {
        // Tentukan kurs konversi (harga per diamond dalam Rupiah).
        // Ini bisa disimpan di environment variable atau database agar lebih mudah diubah.
        const RUPIAH_PER_DIAMOND = 290;
        const MINIMUM_DIAMOND_TOPUP = 10; // Tetapkan batas minimum top-up

        // 1. Ambil jumlah diamond dari request body
        const { diamond_amount } = req.body;
        const userId = req.user.id;

        // 2. Validasi input
        if (diamond_amount === undefined) {
            return res.status(400).json({ message: "Diamond amount is required!" });
        }

        const diamondAmountAsNumber = parseInt(diamond_amount, 10);

        if (isNaN(diamondAmountAsNumber) || diamondAmountAsNumber <= 0) {
            return res.status(400).json({ message: "Diamond amount must be a positive number" });
        }

        if (diamondAmountAsNumber < MINIMUM_DIAMOND_TOPUP) {
            return res.status(400).json({ message: `Minimum top up amount is ${MINIMUM_DIAMOND_TOPUP} diamond.` });
        }
        
        // 3. Kalkulasi harga total dalam Rupiah
        const priceInRupiah = diamondAmountAsNumber * RUPIAH_PER_DIAMOND;
        
        // 4. Dapatkan data user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if( user.role !== "Player") {
            return res.status(403).json({ message: "Forbidden: Only players can purchase diamonds" });
        }
        
        // 5. Siapkan detail transaksi
        const orderId = `diamond-${userId}-${Date.now()}`;
        const customer = {
            email: user.email,
        };

        // 6. Buat transaksi Midtrans dengan harga yang sudah dihitung
        const transaction = await createTransaction(orderId, priceInRupiah, customer);

        // 7. Simpan riwayat pembayaran dengan status pending
        await PaymentHistory.create({
            user_id: userId,
            order_id: orderId,
            total: priceInRupiah, // Total harga dalam Rupiah
            type: "topup",
            details: {
                diamond_amount: diamondAmountAsNumber, // Jumlah diamond yang dibeli
            },
            status: "pending",
        });

        // 8. Kirim token dan URL redirect ke client
        res.status(200).json({
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        });

    } catch (err) {
        console.error("Diamond top-up error:", err);
        res.status(500).json({
            message: "Failed to initiate diamond top-up",
            error: err.message,
        });
    }
};
