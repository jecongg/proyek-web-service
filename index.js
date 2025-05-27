require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./src/routes/user.route");
const skinRoutes = require("./src/routes/skin.route");
const heroRoutes = require("./src/routes/hero.route");
const cartRoutes = require("./src/routes/cart.route");
const paymentRoutes = require("./src/routes/payment.route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/skins", skinRoutes);
app.use("/heroes", heroRoutes);
app.use("/cart", cartRoutes);
app.use("/payment", paymentRoutes);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

main();
