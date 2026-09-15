const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


/*
 * Signup Controller
 *
 * Creates a new user account.
 *
 * Flow:
 * 1. Get user data from the request
 * 2. Validate required fields
 * 3. Check whether email already exists
 * 4. Hash the password
 * 5. Create the user
 * 6. Save the user in MongoDB
 * 7. Send a safe response
 */
const signup = async (req, res) => {

    try {

        // Get the signup data sent by the client
        const { name, email, password } = req.body;


        /*
         * Check required fields.
         *
         * We don't allow an account to be created
         * without these three values.
         */
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }


        /*
         * Check password length before sending it
         * to bcrypt.
         */
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }


        /*
         * Normalize the email.
         *
         * This prevents situations where:
         * User@Example.com
         * user@example.com
         *
         * are treated as different emails.
         */
        const normalizedEmail = email.trim().toLowerCase();


        /*
         * Check whether a user with this email
         * already exists in MongoDB.
         */
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }


        /*
         * Hash the password before storing it.
         *
         * bcrypt does not store the original password.
         * The resulting hash is what we save in MongoDB.
         */
        const hashedPassword = await bcrypt.hash(password, 12);


        /*
         * Create the new user.
         *
         * We deliberately don't accept "role" from req.body.
         * Therefore, public signup always creates a student.
         */
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });


        // Save the new user in MongoDB
        await user.save();


        /*
         * Never send the password or password hash
         * back to the client.
         */
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {

        /*
         * Log the actual error on the server for debugging.
         * The client receives a generic message instead of
         * internal database/application details.
         */
        console.error("Signup error:", error.message);

        res.status(500).json({
            message: "Something went wrong while creating the account"
        });
    }
};


/*
 * Login Controller
 *
 * Authenticates an existing user.
 *
 * Flow:
 * 1. Get email and password
 * 2. Validate required fields
 * 3. Find the user by email
 * 4. Check whether the account is active
 * 5. Compare password with bcrypt hash
 * 6. Create a JWT
 * 7. Send a safe response
 */
const login = async (req, res) => {

    try {

        // Get login data sent by the client
        const { email, password } = req.body;


        /*
         * Check required fields.
         */
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }


        /*
         * Normalize email in the same way as signup.
         */
        const normalizedEmail = email.trim().toLowerCase();


        /*
         * Find the user by email.
         */
        const user = await User.findOne({
            email: normalizedEmail
        });


        /*
         * Use a generic error message.
         *
         * We don't reveal whether an email exists
         * in our database.
         */
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        /*
         * Check whether the account is active.
         *
         * Later, teachers/admins can suspend users
         * by setting isActive to false.
         */
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been suspended"
            });
        }


        /*
         * Compare the password entered by the user
         * with the bcrypt hash stored in MongoDB.
         */
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        /*
         * Create a JWT.
         *
         * Only the user's ID and role are included.
         * Password information is NEVER included.
         */
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        /*
         * Send the JWT using an HttpOnly cookie.
         *
         * HttpOnly prevents browser JavaScript from
         * directly reading the authentication token.
         */
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });


        /*
         * Send only safe user information to the client.
         */
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {

        /*
         * Keep detailed errors on the server only.
         */
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Something went wrong while logging in"
        });
    }
};


module.exports = {
    signup,
    login
};