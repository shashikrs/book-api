const { MESSAGES } = require("../config/constants");
//middleware to check role of a user
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: MESSAGES.ACCESS_DENIED });
    }
    next();
  };
}

module.exports = checkRole;
