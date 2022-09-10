const express = require("express");
const app = express();

const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cookieparser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDatabase = require("./config/database");
const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");
// Setting up config.env file variables
dotenv.config({ path: "./config/config.env" });

// Handling Uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.stack}`);
  console.log(`Shutting down due to uncaught exception.`);
  process.exit(1);
});
// Connection to database
connectDatabase();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// Setup securtiy headers
app.use(helmet());

// Setup body parser
app.use(express.json());

// Setup cookie parser
app.use(cookieparser());

app.use(fileUpload());

app.use(mongoSanitize());

app.use(xssClean());

// Setup CORS - accessible by other domains
app.use(cors());

app.use(
  hpp({
    whitelist: ["positions"],
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 min
  max: 100,
});

app.use(limiter);

// const middlware = (req, res, next) => {
//   console.log("Hello from middlware.");

//   // Setting up user variable globally
//   req.user = "Abhishek Prajapati";
//   next();
// };

// app.use(middlware);
// Importing all routes
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");

app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl}route not found.`, 404));
});

// Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
// const NODE_ENV = process.env.NODE_ENV;

const server = app.listen(PORT, () => {
  console.log(
    `Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Handling Unhandled Promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled promise rejection.`);
  server.close(() => {
    process.exit(1);
  });
});
