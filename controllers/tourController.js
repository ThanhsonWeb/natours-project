const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
	console.log("aliasTopTours called");

	req.query.limit = "5";
	req.query.sort = "-ratingsAverage,price";
	req.query.fields = "ratingsAverage,price,name,summary,difficulty";

	console.log(req.query); // <-- This should print something

	next();
};

exports.getAllTours = async (req, res) => {
	try {
		// EXECUTE QUERY
		// create instance of class  and call method
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const tours = await features.query;
		// Send Responses
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

exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id);

		res.status(200).json({
			status: "success",
			data: {
				tour,
			},
		});
	} catch (err) {
		res.status(404).json({
			status: "fail",
			message: err,
		});
	}
};

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
			message: err,
		});
	}
};

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			status: "success",
			data: {
				tour,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: "fail",
			message: err,
		});
	}
};

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);

		res.status(204).json({
			status: "success",
			data: null,
		});
	} catch (err) {
		res.status(400).json({
			status: "fail to delete",
			message: "Invalid Id",
		});
	}
};
