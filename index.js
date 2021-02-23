const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const morgan = require("morgan");
const db = require("./config/db");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

//load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
db.connect();

//Routes files
const bootcampRoutes = require("./routes/bootcamps");
const courseRoutes = require("./routes/courses");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//dev loggin middleware
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//File uploading
app.use(fileupload());

//Santilize data
app.use(mongoSanitize());

//Set security
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  window: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable Cors
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount router
app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //close server $ exit process
  server.close(() => process.exit(1));
});
