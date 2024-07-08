const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../utils/validate_email");
const auth = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         id: d5fE_asz
 *         email: user@example.com
 *         password: yourpassword
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
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

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login and return access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 accessToken:
 *                   type: string
 *                   description: The JWT access token
 *               example:
 *                 email: user@example.com
 *                 accessToken: youraccesstoken
 *       400:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 */
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

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 accessToken:
 *                   type: string
 *                   description: The JWT access token
 *               example:
 *                 email: user@example.com
 *                 accessToken: yournewaccesstoken
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
