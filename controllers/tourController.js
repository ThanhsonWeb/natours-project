const Tour = require("../models/tourModel");

// Requests Handlers
exports.getAllTours = async (req, res) => {
	try {
		const tours = await Tour.find();
		res.status(200).json({
			status: "success",
			results: tours.length,
			data: {
				tours,
			},
		});
	} catch (err) {
		res.status(404).json({
			status: "fail",
			message: err,
		});
	}
};

exports.getTour = (req, res) => {
	const id = Number(req.params.id);
	// const tour = tours.find((el) => el.id === id); // get exact tour
	res.status(200).json({
		status: "success",
		// data: { tour },
	});
};

// Creating document
//  user post request -> execute this fn

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body); // real data from user

		res.status(201).json({
			status: "success",
			data: {
				tour: newTour,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: "Invalid data sent",
		});
	}
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
