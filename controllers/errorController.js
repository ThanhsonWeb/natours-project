const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		// more info for devs
		stack: err.stack,
		error: err,
	});
};

const sendErrorProd = (err, res) => {
	// error for client (Expected error)
	if (err.isOPerational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		// error fo
		console.log("ERROR 🌋")

		res.status(500).json({
			status: "err",
			message: " Something went wrong"
		});
	}
};
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		sendErrorProd(err, res);
	}
};
