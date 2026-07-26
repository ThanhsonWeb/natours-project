const { promisify } = require("util");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

// request handlers
exports.signup = catchAsync(async (req, res, next) => {
	// just allow user create these 4 fields
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
	});

	// jwt.sign(payload, secret, options)
	const token = signToken(newUser._id);

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
	const token = signToken(user._id);
	res.status(200).json({
		status: "success",
		token,
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	// 1. get token and check if it exist
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token) {
		return next(new AppError("Please log in to access", 401));
	}
	// 2.Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	console.log(decoded); // { id: '6a61496f', iat: 17485, exp: 17885 }

	// 3. check if user still exists
	// test : delete user -> old token is Invalid
	const freshUser = await User.findById(decoded.id);
	if (!freshUser) {
		return next(
			new AppError("The user belonging to this token no longer exists.", 401),
		);
	}

	// 4. check if user changed password after token was issued

	// iat (6:00)< passwordChangedAt(6:20) -> true
	// old token from the old password should be Invalid
	if (freshUser.changedPasswordAfter(decoded.iat) === true) {
		return next(
			new AppError("User recently changed password. Please log in again.", 401),
		);
	}
	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = freshUser;
	next();
});
