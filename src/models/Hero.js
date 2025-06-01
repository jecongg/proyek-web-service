const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    diamond_price: { type: Number, required: true },
    battle_point_price: { type: Number, required: true },
    role1: { type: String },
    role2: { type: String },
});

module.exports = mongoose.model("Hero", heroSchema, "heroes");
