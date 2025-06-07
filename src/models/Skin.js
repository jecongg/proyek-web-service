const mongoose = require("mongoose");

const skinSchema = new mongoose.Schema({
    name: { type: String, required: true },
    diamond_price: { type: Number },
    skin_type: {
        type: String,
        enum: ["Basic", "Elite", "Special", "Epic", "Legend", "Starlight"],
    },
    id_hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hero",
    },
    isBuyable: {
        type: Boolean,
        default: true, // Default: bisa dibeli
    },
    image_skin: { type: String, required: true },
});

module.exports = mongoose.model("Skin", skinSchema, "skins");