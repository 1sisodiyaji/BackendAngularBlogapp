const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");


// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../src/assets/user"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + Date.now() + ext);
    },
});

// Multer upload instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

function generateUsername(name) { }
// Register a new user with profile image uploadconst checkRequiredFields = (req, res) => {
router.post("/register", upload.single("image"), async (req, res) => {
    try {
        const { name, lastname, email, password, about } = req.body;
        const image = req.file ? req.file.filename : "default.jpg";

        if (!name || !lastname || !email || !password || !about) {
            return res
                .status(400)
                .json({ message: "Please fill in all required fields" });
        }

        // Generate username
        const randomDigits = Math.floor(100 + Math.random() * 900);
        const username = `${name}@${randomDigits}`;

        // Check if the email already exists
        let user = await User.findOne({ email });

        if (user) {
            return res
                .status(409)
                .json({ message: "User with this email already exists" });
        }

        // Create a new user instance
        user = new User({
            name,
            lastname,
            username,
            email,
            password,
            image,
            about,
        });

        // Save the user to the database
        const savedUser = await user.save();

        if (savedUser) {
            console.log("Your data is saved");
            return res
                .status(201)
                .json({ message: "Your account is created successfully" });
        } else {
            console.log("Your data is not saved");
            return res
                .status(500)
                .json({ message: "Registration failed. Please try again later." });
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Registration failed. Please try again later." });
    }
});

// Login a user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(401)
                .json({ message: "Please fill in all required fields" });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "User does not exist. Please create an account" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return the token and user details
        console.log(token,user);
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/all", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error("Failed to fetch users:", err.message);
        res.status(500).send("Failed to fetch users");
    }
});

router.get("/getbyid/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Failed to fetch user:", err.message);
        res.status(500).send("Failed to fetch user");
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id);

        if (!deleteUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).send("User deleted successfully");
    } catch (err) {
        console.error("Failed to delete User:", err.message);
        res.status(500).send("Failed to delete User");
    }
});

router.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Update only the fields that are provided in the request body
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password; // This will be hashed by the pre-save middleware

        // Handle image upload if a file is provided
        if (req.file) {
            user.image = req.file.filename; // Assuming multer has saved the file
        }

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Failed to update user:", err.message);
        res.status(500).send("Failed to update user");
    }
});

module.exports = router;
