const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true
        },
        region: {
            type: String,
            required: true
        },
        profile_picture: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["Admin", "Player"],
            default: 'Player'
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
        experience: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
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
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
