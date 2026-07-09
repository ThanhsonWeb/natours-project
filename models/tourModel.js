const mongoose = require("mongoose");
// Schema = Blueprint (what data looks like)
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

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour