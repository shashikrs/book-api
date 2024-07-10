const mongoose = require("mongoose");
const validateEmail = require("../utils/validate_email");
const { ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: [validateEmail, "Please enter a valid email"],
    unique: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [ROLES.ADMIN, ROLES.USER],
    default: ROLES.USER,
  },
});

module.exports = mongoose.model("User", userSchema);
