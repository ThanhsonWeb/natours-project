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

// statistics = thống kê

exports.getTourStats = async (req, res) => {
	try {
		const stats = await Tour.aggregate([
			// filters the tours
			{
				$match: { ratingsAverage: { $gte: 4.5 } },
			},
			// calculates statistics
			{
				$group: {
					_id: "$difficulty",
					numTours: { $sum: 1 }, //count documents in the group.
					numRatings: { $sum: "$ratingsQuantity" },
					avgRating: { $avg: "$ratingsAverage" },
					avgPrice: { $avg: "$price" },
					// minPrice: { $min: "$price" },
					// maxPrice: { $max: "$price" },
				},
			},
			//  (1 = ascending, -1 = descending).
			{
				$sort: {
					avgRating: -1,
				},
			},
			// {
			// 	$match: { _id: { $ne: "easy" } },
			// },
		]);
		// send Response
		res.status(200).json({
			status: "success",
			results: stats.length,
			data: {
				stats,
			},
		});
	} catch (err) {
		res.status(404).json({
			status: "fail to load",
			message: err,
		});
	}
};

exports.getMonthlyPlan = async (req, res) => {
	try {
		const year = req.params.year * 1; //2021
		const plan = await Tour.aggregate([
			{
				$unwind: "$startDates", // It breaks one document into multiple documents (9*3 = 27)
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lt: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: "$startDates" },
					numToursStarts: { $sum: 1 }, // count tour of each month
					tours: { $push: "$name" },
				},
			},
			{
				$addFields: { month: "$_id" },
			},
			{
				$project: {
					_id: 0,
				},
			},
			{
				$sort: {
					numToursStarts: -1,
				},
			},
			
		]);

		res.status(200).json({
			status: "success",
			results: plan.length,
			data: {
				plan,
			},
		});
	} catch (err) {
		res.status(404).json({
			status: "fail to load",
			message: err,
		});
	}
};
