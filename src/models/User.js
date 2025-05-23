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
            default: null
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
        battle_point: Number,

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
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
