const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../utils/validate_email");
const auth = require("../middleware/auth");

//New user registration
router.post("/register", validateUser, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Login and return access token
router.post("/login", validateUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user == null) {
      return res.status(404).json({
        message: `User with email: ${req.body.email} not found`,
      });
    }

    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET
      );
      res.json({ email: user.email, accessToken });
    } else {
      return res.status(400).json("Incorrect password");
    }
  } catch (err) {
    if (err.status == 500) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//Refresh access token
router.post("/refresh-token", auth, async (req, res) => {
  try {
    const user = req.user;

    if (user == null) {
      return res.status(404).json({
        message: `User with email: ${req.body.email} not found`,
      });
    }

    const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    res.json({ email: user.email, accessToken });
  } catch (err) {
    if (err.status == 500) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//middleware to validate login data
async function validateUser(req, res, next) {
  if (!req.body.email)
    return res.status(400).json({ message: "Email not provided" });
  if (!validateEmail(req.body.email))
    return res.status(400).json({ message: "Invalid email" });
  if (!req.body.password)
    return res.status(400).json({ message: "Password not provided" });
  next();
}

module.exports = router;
