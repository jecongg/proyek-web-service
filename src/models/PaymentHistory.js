const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order_id: {
        type: String,
        required: true,
        unique: true,
    },
    total: {
        type: Number,
        required: true,
    },
    payment_method: {
        type: String,
        enum: ["gopay", "credit_card", "shopeepay", "bank_transfer", "other"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
    },
    type: {
        type: String,
        enum: ["topup", "starlight"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
