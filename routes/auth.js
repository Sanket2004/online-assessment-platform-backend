const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, name, phone } = req.body;
  console.log(req.body);


  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token with 1 day expiration
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Send user details along with the token
  res.json({
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      // Include any other user fields you want to send back
    },
  });
});

// User logout
router.post("/logout", (req, res) => {
  // Since JWTs are stateless, logout can be handled by client-side token removal.
  // Optionally, you can implement a blacklist strategy or revoke tokens server-side.
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
