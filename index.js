const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./src/routes/user.route");
const skinRoutes = require("./src/routes/skin.route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/skins", skinRoutes);

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mobile_legend_db");
    console.log("Connected to MongoDB");
    
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

main();
