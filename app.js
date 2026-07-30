const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandling = require("./controllers/errorController");
const AppError = require("./utils/appError");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("query parser", "extended");

// 1.Global MIDDLEWARES
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev")); // login middleware
}

const limiter = rateLimit({
	max: 100, // ALLOW 100 req same IP in one hour
	windowMs: 60 * 60 * 1000,
	message: "Too many req from this IP, pls try again in an hour",
});

app.use("/api", limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// 2. Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// user visit wrong route
app.all("*", (req, res, next) => {
	// create an instance of the class
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handling middleware
app.use(globalErrorHandling);

module.exports = app;
