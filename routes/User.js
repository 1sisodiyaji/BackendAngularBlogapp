const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer and cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-app', // Folder name on Cloudinary
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});
const parser = multer({ storage: storage });


router.post("/register", parser.single('image'), async (req, res) => {
  const { name, email, password, about } = req.body;
  const image = req.file ? req.file.path : 'default.jpg';
  if (!name || !email || !password || !image || !about) {
    return res.status(401).json({ message: "Please fill the data" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(404).json({ message: "User already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const formattedName = name.replace(/\s+/g, "_").toLowerCase();
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    const username = `@${formattedName}${randomNumber}`;
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      username,
      image,
      about,
    });
    const savedUser = await newUser.save().catch((error) => {
      console.error("Error saving user to database:", error);
      throw error;
    });
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1y", // Token expiration time
      }
    );


    // Set the token in a cookie
    res.cookie("token", token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Registration successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Account creation Failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      status: "error",
      message: "Please fill the data Correctly.",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Account does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(409).json({ message: "Invalid password" });

    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1y", // Token expiration time
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Login Suucess", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login Failed" });
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
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    return res.status(200).json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err.message);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  console.log("delete id" + req.params.id);
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Failed to delete User:", err.message);
    return res.status(500).json({ message: "Failed to delete User" });
  }
});

router.put("/update/:id", parser.single('image'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send("User not found");
  } else {
    try {
      const image = req.file ? req.file.path : 'default.jpg';
      const { name, about } = req.body;
      if (name) user.name = name;
      if (about) user.about = about;

      if (req.file) {
        user.image = image;
      }

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error("Failed to update user:", err.message);
      res.status(500).send("Failed to update user");
    }
  }
});



module.exports = router;
