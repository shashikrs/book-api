const jwt = require("jsonwebtoken");
const User = require("../models/user");

//middle to verify the access token
const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
