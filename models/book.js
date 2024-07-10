const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  owner: { type: mongoose.Schema.ObjectId, required: true },
});

module.exports = mongoose.model("Book", bookSchema);
