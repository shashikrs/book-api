const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const requestHandler = require("../middleware/request_handler");
const auth = require("../middleware/auth");
const { ROLES, MESSAGES } = require("../config/constants");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *    bearerAuth:
 *     type: http
 *     scheme: bearer
 *   security:
 *     - bearerAuth: []
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *       example:
 *         id: d5fE_asz
 *         title: The Great Gatsby
 *         author: F. Scott Fitzgerald
 */

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 */
router.post("/", auth, async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      owner: req.user._id,
    });
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Books not found
 */
router.get("/", auth, async (req, res) => {
  try {
    let books = [];
    if (req.user.role != ROLES.ADMIN) {
      books = await Book.find({ owner: req.user._id });
    } else {
      books = await Book.find();
    }

    res.status(200).json(books);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get a single book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: A single book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get("/:id", [auth, requestHandler, checkOwnership], async (req, res) => {
  const book = await getBook(req, res);
  res.json(book);
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   patch:
 *     summary: Patch a single book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book patched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  [auth, requestHandler, checkOwnership],
  async (req, res) => {
    try {
      const updatedBook = await Book.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );

      const book = await getBook(req, res);

      console.log(book);
      res.json(res.book);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Update a single book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.put("/:id", [auth, requestHandler, checkOwnership], async (req, res) => {
  try {
    let book = await getBook(req, res);
    book = { ...book, ...req.body };
    const updatedBook = await res.book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete a single book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  [auth, requestHandler, checkOwnership],
  async (req, res) => {
    try {
      const book = await getBook(req, res);
      await book.deleteOne();
      return res.status(204).json(MESSAGES.BOOK_DELETED);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: MESSAGES.BOOK_NOT_DELETED });
    }
  }
);

//middleware to get book by id
async function getBook(req, res) {
  let book;
  try {
    book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: MESSAGES.BOOK_NOT_FOUND });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
  return book;
}

//middleware to check if the user owns the book
async function checkOwnership(req, res, next) {
  try {
    const book = await getBook(req, res);
    if (
      req.user.role !== ROLES.ADMIN &&
      book.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: MESSAGES.ACCESS_DENIED });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = router;
