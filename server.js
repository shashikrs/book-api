const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const versionPath = "/api/v1";

//loads `.env` file contents into process.env
dotenv.config();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
  },
  apis: [
    "./server.js",
    "./routes/books.js",
    "./routes/users.js",
    "./models/book.js",
    "./models/user.js",
  ],
};
//initialize
const app = express();
const port = process.env.PORT || 3000;

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//configure cors
const corsOptions = {
  origin: true,
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

// Versioned routes
const v1Router = express.Router();
v1Router.get("/", (req, res) => {
  res.send("Welcome to Books Store API version 1");
});

// Register versioned routes
app.use(versionPath, v1Router);

// APIs
app.use(`${versionPath}/books`, booksRouter);
app.use(`${versionPath}/users`, usersRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Books store!");
});

//start the server
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}${versionPath}`);
});

/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: A simple greeting from the book-store!
 *     responses:
 *       200:
 *         description: Success
 */
