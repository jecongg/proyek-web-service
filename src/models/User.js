const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
        email: String,
        gender: String,
        region: String,
        profile_picture: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["Admin", "Player"],
        },
        diamond: {
            type: Number,
            default: 0,
        },
        starlight: {
            type: Boolean,
            default: false,
        },
        battle_point: {
            type: Number,
            default: 0,
        },

        // Relasi ke hero dan skin (referensi)
        owned_heroes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hero",
            },
        ],
        owned_skins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Skin",
            },
        ],
        cart: [
            {
                item_id: mongoose.Schema.Types.ObjectId,
                item_type: {
                    type: String,
                    enum: ["Hero", "Skin"],
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
