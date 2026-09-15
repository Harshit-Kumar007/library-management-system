const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();


/*
 * Signup Route
 *
 * POST /api/auth/signup
 *
 * Passes the request to the signup controller,
 * where validation, password hashing, and user
 * creation are handled.
 */
router.post("/signup", signup);


/*
 * Login Route
 *
 * POST /api/auth/login
 *
 * Passes the request to the login controller,
 * where credentials are verified and a JWT
 * authentication cookie is created.
 */
router.post("/login", login);


module.exports = router;