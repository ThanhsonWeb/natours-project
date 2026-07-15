const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.set("query parser", "extended");

// MIDDLEWARES
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev")); // login middleware
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	console.log(req.requestTime);
	next();
});

// 2. Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
// all = all HTTP request
app.all("*", (req, res, next) => {
	res.status(404).json({
		status: "fail",
		message: `Can't find ${req.originalUrl} on this server`,
	});
});


module.exports = app;
