const AppError = require("../utils/appError");
// nice friendly error for users
const handleCastErrorDB = (err) => {
	// path = _id  || value = wwwww
	const message = `Invalid ${err.path} : ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const value = Object.values(err.keyValue)[0];
	const message = `Duplicate field value: "${value}". Use another value.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errorMessage = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data - ${errorMessage.join(". ")}`;
	return new AppError(message, 400);
};

const handleJWTError = (err) => {
	//401 : unauthorized
	return new AppError("Invalid token. Please log in again", 401);
};

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		// more info for devs
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	// error for client (Expected error)
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		console.log("ERROR 🌋");

		res.status(500).json({
			status: "err",
			message: " Something went very wrong",
		});
	}
};
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error ok";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = err;

		if (error.name === "CastError") {
			error = handleCastErrorDB(error);
		}

		if (error.code === 11000) error = handleDuplicateFieldsDB(error);

		if (error.name === "ValidationError")
			error = handleValidationErrorDB(error);

		if (error.name === "JsonWebTokenError") error = handleJWTError(error);

		sendErrorProd(error, res);
	}
};
