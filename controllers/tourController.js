const Tour = require("../models/tourModel");

// const tours = JSON.parse(
// 	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res.status(400).json({
			status: "fail",
			message: "Missing name or price ?",
		});
	}
	next();
};

// Requests Handlers
exports.getAllTours = (req, res) => {
	res.status(200).json({
		status: "success",
		// results: tours.length,
		// data: {
		// 	tours,
		// },
	});
};

exports.getTour = (req, res) => {
	const id = Number(req.params.id);
	// const tour = tours.find((el) => el.id === id); // get exact tour
	res.status(200).json({
		status: "success",
		// data: { tour },
	});
};

exports.createTour = (req, res) => {
	res.status(201).json({
		status: "success",
		// data: {
		// 	tour: newTour,
		// },
	});
};

exports.updateTour = (req, res) => {
	res.status(200).json({
		status: "success",
		data: {
			tour: "<Update tour here....>",
		},
	});
};

exports.deleteTour = (req, res) => {
	res.status(204).json({
		status: "success",
		data: null,
	});
};
