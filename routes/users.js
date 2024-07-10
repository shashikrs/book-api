const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateEmail = require("../utils/validate_email");
const auth = require("../middleware/auth");
const user = require("../models/user");
const checkRole = require("../middleware/check_role");
const { ROLES, MESSAGES } = require("../config/constants");

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
    const user = await newUser(req, ROLES.USER); // roles is set to user always
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//create admin user (admin only)
router.post("/create-admin", validateUser, async (req, res) => {
  try {
    const user = await newUser(req, ROLES.ADMIN); // roles is set to admin always
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

    if (!user) {
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
      return res.status(400).json(MESSAGES.INCORRECT_PASSWORD);
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

    if (!user) {
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
    return res.status(400).json({ message: MESSAGES.EMAIL_NOT_PROVIDED });
  if (!validateEmail(req.body.email))
    return res.status(400).json({ message: MESSAGES.INVALID_EMAIL });
  if (!req.body.password)
    return res.status(400).json({ message: MESSAGES.PASSWORD_NOT_PROVIDED });
  next();
}

//function to instantiate a new user
async function newUser(req, role) {
  if (!role) role = ROLES.USER;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  return new User({
    email: req.body.email,
    password: hashedPassword,
    role,
  });
}

module.exports = router;
