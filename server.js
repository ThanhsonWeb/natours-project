const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD,
);

// connect database by mongoose
mongoose
	// .connect(process.env.DATABASE_LOCAL, {
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("DB Connection Successfully");
	});

// specify a schema for our data

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

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
