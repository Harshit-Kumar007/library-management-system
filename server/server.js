// Import Express to create and manage our backend server
const express = require("express");

// Import CORS to allow communication between frontend and backend
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Load environment variables from the server/.env file
require("dotenv").config({ path: "./.env" });
// Import the function that connects our application to MongoDB
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
// Create an Express application
const app = express();


// -------------------- Middleware --------------------

// Enable CORS so requests from our frontend can reach the backend
app.use(cors());

// Allow Express to read JSON data sent in HTTP requests
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

// -------------------- Routes --------------------

// Root route used to check whether the API is running
app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running"
    });
});


// -------------------- Server Configuration --------------------

// Use the PORT from .env, or use 5000 if PORT is not defined
const PORT = process.env.PORT || 5000;

// Connect the application to MongoDB
connectDB();

// Start the Express server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});