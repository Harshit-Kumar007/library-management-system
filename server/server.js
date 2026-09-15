const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./server/.env" });
const connectDB = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running"
    });
});

const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});