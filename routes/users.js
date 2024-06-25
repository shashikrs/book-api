const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../utils/validate_email");

//New user registration
router.post("/register", checkUser, async (req, res) => {
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
router.post("/login", checkUser, async (req, res) => {
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
      res.json({ accessToken });
    } else {
      return res.status(400).json("Icorrect password");
    }
  } catch (err) {
    if (err.status == 500) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//middleware to validate login data
async function checkUser(req, res, next) {
  if (!req.body.email)
    return res.status(400).json({ message: "Email not provided" });
  if (!validateEmail(req.body.email))
    return res.status(400).json({ message: "Invalid email" });
  if (!req.body.password)
    return res.status(400).json({ message: "Password not provided" });
  next();
}

module.exports = router;
