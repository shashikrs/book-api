const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const requestHandler = require("../middleware/middleware");

// POST /books - Add a new book
router.post("/", async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
    });
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /books - Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// GET /books/:id - Get a single book
router.get("/:id", [requestHandler, getBook], async (req, res) => {
  res.json(res.book);
});

// PATCH /books/:id - Patch a single book
router.patch("/:id", [requestHandler, getBook], async (req, res) => {
  try {
    const updatedBook = await Book.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.json(res.book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /books/:id - Update a single book
router.put("/:id", [requestHandler, getBook], async (req, res) => {
  try {
    res.book._doc = { ...res.book._doc, ...req.body };
    const updatedBook = await res.book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /books/:id - Delete a single book
router.delete("/:id", [requestHandler, getBook], async (req, res) => {
  try {
    await res.book.deleteOne();
    res.status(204).json("Book deleted");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Book not deleted" });
  }
});

//middleware to get book by id
async function getBook(req, res, next) {
  let book;
  try {
    book = await Book.findById(req.params.id);
    if (book == null) {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.book = book;
  next();
}

module.exports = router;
