const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// name , email , photo , password , passwordConFirm
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
	password: {
		type: String,
		required: [true, "please provide your password"],
		minlength: 8,
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
const User = mongoose.model("User", userSchema);

module.exports = User;
