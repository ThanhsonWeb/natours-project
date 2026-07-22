const mongoose = require("mongoose");

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
	},
});

const User = mongoose.model("User", userSchema);

module.exports = User;
