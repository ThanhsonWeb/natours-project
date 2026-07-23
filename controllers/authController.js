const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

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
	console.log(token);
	res.status(201).json({
		status: "success",
		token,
		data: {
			user: newUser,
		},
	});
});
