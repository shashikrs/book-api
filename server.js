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

//cdn CSS
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

//swagger setup
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

//serve static files from the 'public' directory
app.use(express.static("public"));

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customSiteTitle: "Backend Generator",
    customfavIcon: "https://avatars.githubusercontent.com/u/6936373?s=200&v=4",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js",
    ],
    customCssUrl: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css",
    ],
  })
);

//configure cors
const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

//connect to db
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

//middleware
app.use(express.json());

//versioned routes
const v1Router = express.Router();
v1Router.get("/", (req, res) => {
  res.send("Welcome to Books Store API version 1");
});

//register versioned routes
app.use(versionPath, v1Router);

//APIs
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
