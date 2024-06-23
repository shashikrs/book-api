const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const booksRouter = require("./routes/books");

//loads `.env` file contents into process.env
dotenv.config();

//initialize
const app = express();
const port = process.env.PORT || 3000;

//connect to db
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

//middleware
app.use(express.json()); // to parse json bodies

app.use("/books", booksRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Books store!");
});

//start the server
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
