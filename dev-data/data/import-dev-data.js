const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Tour = require("../../models/tourModel");

const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD,
);

//-------------------------- connect database -----------------------------
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("DB Connection Successfully");
	});

// Read JSON file
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"),
);

// IMPORT DATA INTO DataBase

const importData = async () => {
	try {
		await Tour.create(tours);
		console.log("Data successfully loaded");
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

// DELETE all Data from Database
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log("Data successfully deleted");
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === "--import") {
	importData();
} else if (process.argv[2] === "--delete") {
	deleteData();
}

// console.log(process.argv);


// process.argv = an array containing the command used to start your Node.js program.
// process.argv[2] = the first custom argument you type after the filename.
// It lets your program behave differently based on the command (e.g. --import or --delete).