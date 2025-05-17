const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = 3000;
app.listen(port, async () => {
    try {
        console.log(`Application running at http://localhost:${port}`);
    } catch (error) {
        console.error("Gagal menghubungkan:", error);
    }
});
