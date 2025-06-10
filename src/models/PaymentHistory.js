const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        order_id: {
            type: String,
            required: true,
            unique: true,
            index: true, // Saran: Tambahkan index untuk pencarian cepat
        },
        total: {
            type: Number,
            required: true,
        },
        payment_method: {
            type: String, // Saran: Hapus enum agar lebih fleksibel
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed", "expired", "canceled"], // Saran: Status lebih lengkap
            default: "pending",
        },
        type: {
            type: String,
            enum: ["topup", "starlight"],
            required: true,
        },
        // Saran (Penting): Tambahkan field ini untuk menyimpan detail item
        details: {
            diamond_amount: {
                type: Number,
            },
        },
    },
    // Saran: Gunakan timestamps bawaan Mongoose
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema, "payment_histories");