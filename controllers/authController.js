const { promisify } = require("util");
const crypto = require("crypto");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	res.status(statusCode).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
};

// request handlers
exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		passwordChangedAt: req.body.passwordChangedAt,
		role: req.body.role,
	});

	createSendToken(newUser, 201, res);
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
	createSendToken(user, 200, res);
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
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError("The user belonging to this token no longer exists.", 401),
		);
	}

	// 4. check if user changed password after token was issued

	// iat (6:00)< passwordChangedAt(6:20) -> true
	// old token from the old password should be Invalid
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("User recently changed password. Please log in again.", 401),
		);
	}
	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		console.log("user.role", req.user.role);

		//roles ["admin","lead-guide"]
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403),
			);
		}

		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1. Get user  based on Posted email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError("There is no user with that email address", 404));
	}
	// Because user is a Mongoose document, and methods defined in userSchema.methods are automatically available on every user document.
	// 2. Generate the random reset token
	const resetToken = user.createPasswordResetToken(); //abc123

	await user.save({ validateBeforeSave: false }); // don't run validate

	// 3. Send it to user's email
	const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH req with your new password to : ${resetURL} , If you didn't request a password reset,  please ignore this email `;
	try {
		await sendEmail({
			email: user.email, //son@gmail.com
			subject: "Your password reset token (valid for 10 minutes)",
			message,
		});

		res.status(200).json({
			status: "success",
			message: "Token sent to email ^^",
		});
	} catch (error) {
		console.log(error);
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError(
				"There was an error sending the email . Try again later ! ",
				500,
			),
		);
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// PATCH /resetPassword/abc123
	const hashedToken = crypto
		.createHash("sha256")
		.update(req.params.token) // abc123 -> 9f87d659a2feaa0...
		.digest("hex");
	console.log(hashedToken);

	// 1) Get user based on the token
	const user = await User.findOne({
		passwordResetToken: hashedToken, // 9f87d.. == 9f87d.. -> true
		passwordResetExpires: { $gt: Date.now() }, // 20:25 > 20:43 -> FALSE -> NULL
	});

	if (!user) {
		return next(new AppError("Token is Invalid or expired", 400));
	}
	// modify user
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined; //delete
	user.passwordResetExpires = undefined; //delete
	//actually update to mongoDb
	await user.save();

	// Log the User in, send JWT
	const token = signToken(user._id);

	res.status(200).json({
		status: "success ",
		token,
	});
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	console.log("RUNNNNNNNNNNNNNNNNNNNN");
	// 1 . Get user from collection
	// req.user.id = currentUser.id (the guy who login)
	const user = await User.findById(req.user.id).select("+password");

	// 2) Check if POSTed current password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError("Your current password is wrong.", 401));
	}

	//3. correct ? -> allow update pass
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save(); // use save instead Update cause "prev save "

	// 4. Log user in
	createSendToken(user, 200, res);
});
