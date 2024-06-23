const mongoose = require("mongoose");

const requestHandler = (req, res, next) => {
  if (req.params.id) {
    const validId = mongoose.isValidObjectId(req.params.id);

    if (!validId) {
      return res
        .status(400)
        .json({ message: `Request id: ${req.params.id} is invalid` });
    }
  }
  next();
};

module.exports = requestHandler;
