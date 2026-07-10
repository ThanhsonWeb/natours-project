const express = require("express");

const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.set("query parser", "extended");

// 1
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
// makes everything inside /public accessible to the browser.
// ex : http://localhost:3000/overview.html
app.use(express.static(`${__dirname}/public`));

// Middleware apply to  every request
app.use((req, res, next) => {
	console.log("hello from middleware 🌟");
	next();
});

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	console.log(req.requestTime);
	next();
});

// 2. Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
