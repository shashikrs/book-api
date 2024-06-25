const jwt = require("jsonwebtoken");

//middle to verify the access token
const auth = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];

  if (!bearerToken) res.sendStatus(403);

  const token = bearerToken.split(" ")[1];

  if (token == null) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = auth;
