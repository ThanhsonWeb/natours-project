const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A tour must have a name"],
			unique: true,
			trim: true,
			// built in validators
			maxlength: [40, "A tour name must have less or equal then 40 characters"],
			minlength: [10, "A tour name must have less or equal then 40 characters"],
		},
		slug: String,

		duration: {
			type: Number,
			required: [true, "A tour must have a duration"],
		},

		maxGroupSize: {
			type: Number,
			required: [true, "A tour must have a group size"],
		},

		difficulty: {
			type: String,
			required: [true, "A tour must have a difficulty"], //validate
			enum: {
				values: ["easy", "medium", "difficult"],
				message: "Difficulty is either: easy, medium, difficult",
			},
		},

		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Rating must be above 1.0"],
			max: [5, "Rating must be less than or equal to 5.0"],
		},

		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "A tour must have a price"],
		},

		summary: {
			type: String,
			trim: true,
			required: [true, "A tour must have a summary"],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, "A tour must have a cover Image"],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false,
		},
	},
	{
		// data get output = appear virtual
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

tourSchema.virtual("durationWeeks").get(function () {
	return this.duration / 7;
});

// Document MiddleWare
// the document before it is saved.
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// tourSchema.pre("save", function (next) {
// 	console.log("WIll save document");
// 	next();
// });

// tourSchema.post("save", function (doc, next) {
// 	// doc is the saved document
// 	console.log(doc);
// 	next();
// });

// Query MiddleWare
// tourSchema.pre("find", function (next) {
// /^find/ : for all command start w find "findById,..."
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	// this.find({ secretTour: true  });
	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`);
	// console.log(docs);
	next();
});

//Aggregation middleware
tourSchema.pre("aggregate", function (next) {
	// Goal : we want to remove VIP tour before it aggregate 🌟

	// unshift = insert at the front
	// pipeline  is
	//   { '$match': { secretTour: [Object] } },
	//   { '$match': { ratingsAverage: [Object] } },
	//   { '$group': {
	//       _id: '$difficulty',}
	//   },
	//   { '$sort': { avgRating: -1 } }

	this.pipeline().unshift({
		$match: { secretTour: { $ne: true } },
	});
	// "this" is the current aggregation object
	console.log(this.pipeline());
	next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
