const mongoose = require("mongoose");

/*
 * User Schema
 *
 * Defines the structure and basic validation rules
 * for users stored in MongoDB.
 */
const userSchema = new mongoose.Schema(
    {
        // User's full name
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        // Email is used as the unique identity for login
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254
        },

        /*
         * Password
         *
         * The plain-text password must NEVER be stored
         * in MongoDB. We will hash it using bcrypt
         * before creating the user.
         */
        password: {
            type: String,
            required: true,
            minlength: 8
        },

        /*
         * Role determines what the user is allowed to do.
         *
         * A new account is always a student by default.
         * Admin accounts will NOT be created freely through
         * normal public signup.
         */
        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student"
        },

        /*
         * Account status
         *
         * Setting this to false allows an authorized
         * teacher/admin action to suspend an account.
         */
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }
);


/*
 * Create the User model from the schema.
 *
 * Mongoose will use the "users" collection
 * for documents created through this model.
 */
const User = mongoose.model("User", userSchema);

module.exports = User;