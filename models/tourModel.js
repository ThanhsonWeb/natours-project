const mongoose = require("mongoose");
// Schema = define data structure
// Model = Tool (used to create, read, update, delete data)
const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "A tour must have a name"], //validate
	},
	rating: {
		type: Number,
		default: 4.5,
	},
	price: {
		type: Number,
		required: [true, "A tour must have a price"],
	},
});
// Tour (tours collections) is a Mongoose model -> we perform CRUD on Tour,
//
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
