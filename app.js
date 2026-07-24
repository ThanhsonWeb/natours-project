const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandling = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();
app.set("query parser", "extended");

// MIDDLEWARES
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev")); // login middleware
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
// 	 console.log(req.headers);
// 	next();
// });

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
