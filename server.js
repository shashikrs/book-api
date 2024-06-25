const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const cors = require("cors");

//loads `.env` file contents into process.env
dotenv.config();

//initialize
const app = express();
const port = process.env.PORT || 3000;

//configure cors
const corsOptions = {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  credentials: true, // Allow credentials
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

//connect to db
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

//middleware
app.use(express.json()); // to parse json bodies

app.use("/books", booksRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Books store!");
});

//start the server
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
