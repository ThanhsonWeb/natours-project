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
		// name : "CastError" and code: 11000 from our dev mode error
		//  create conditional base on error in dev mode
		if (error.name === "CastError") {
			error = handleCastErrorDB(error);
		}
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		

		sendErrorProd(error, res);
	}
};
