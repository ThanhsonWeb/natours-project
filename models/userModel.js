const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please give us a name"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "please provide your email"],
		unique: true,
		lowercase: true,
		trim: true,
	},
	photo: {
		type: String,
	},
	role: {
		type: String,
		enum: ["user", "guide", "lead-guide", "admin"],
		default: "user",
	},
	password: {
		type: String,
		required: [true, "please provide your password"],
		minlength: 8,
		select: false,
	},

	passwordConfirm: {
		type: String,
		required: [true, "please confirm your password"],
		validate: {
			// only work on CREATE request !
			validator: function (value) {
				return this.password === value; // true or false
			},
			message: "Validation failed nha",
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
});

// Before create()
userSchema.pre("save", async function (next) {
	// Only run if the password was actually modified
	if (!this.isModified("password")) return next();

	// Hash the password with a cost factor of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Remove passwordConfirm before saving
	this.passwordConfirm = undefined;

	next();
});

userSchema.pre("save", function (next) {
	// create new document -> modify pass
	if (!this.isModified("password") || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// compare password using bcrypt again
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};
// create methods
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		//  change 2026-08-25 (date) into 1231241 (timestamp)
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10,
		);
		return JWTTimestamp < changedTimestamp;
	}
	// user not changed password
	return false;
};
// generate a random token -> emailed to the user later .
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex"); //abc123
	// store hashed token and expires time to mongoDB
	this.passwordResetToken = crypto
		.createHash("sha256") // abc123 -> 9f87d659a2feaa0...
		.update(resetToken)
		.digest("hex");

	console.log({ resetToken });

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	// 2026-07-27T13:25:34.533+00:00 (this is UTC ) Vn is (UTC + 7 = 13+7 = 20:25)

	return resetToken; // still abc123
};
const User = mongoose.model("User", userSchema);

module.exports = User;
