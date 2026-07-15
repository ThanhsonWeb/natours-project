const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// goal : clean try - catch block
exports.aliasTopTours = (req, res, next) => {
	console.log("aliasTopTours called");

	req.query.limit = "5";
	req.query.sort = "-ratingsAverage,price";
	req.query.fields = "ratingsAverage,price,name,summary,difficulty";

	console.log(req.query); // <-- This should print something

	next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
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
});

exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id);

	if (!tour) {
		return next(new AppError("No tour found with that ID ", 404));
		// next(err) for global error handling
	}

	res.status(200).json({
		status: "success",
		data: {
			tour,
		},
	});
});

exports.createTour = catchAsync(async (req, res, next) => {
	const newTour = await Tour.create(req.body); // real data from user

	res.status(201).json({
		status: "success",
		data: {
			tour: newTour,
		},
	});
});

exports.updateTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!tour) {
		return next(new AppError("No tour found with that ID ", 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			tour,
		},
	});
});

exports.deleteTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id);
	if (!tour) {
		return next(new AppError("No tour found with that ID ", 404));
		// next(err) for global error handling
	}
	res.status(204).json({
		status: "success",
		data: null,
	});
});

// statistics

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});
