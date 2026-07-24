const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

// request handlers
exports.signup = catchAsync(async (req, res, next) => {
	// just allow user create these 4 fields
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});

	// jwt.sign(payload, secret, options)
	const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	res.status(201).json({
		status: "success",
		token,
		data: {
			user: newUser,
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1. check if email and password exist
	if (!email || !password) {
		return next(new AppError("please Provide your email and password", 400));
	}

	// 2. check if it exists
	const user = await User.findOne({ email }).select("+password");
	//find exact that user by email
	// password → the password the user typed (plain text)
	// user.password → the hashed password stored in MongoDB
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect email or password", 401));
	}
	console.log(user);

	// 3. if it valid -> send token to client
	const token = "fake token";
	res.status(200).json({
		status: "success",
		token,
	});
});
