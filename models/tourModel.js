const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A tour must have a name"], //validate
			trim: true,
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
		},

		ratingsAverage: {
			type: Number,
			default: 4.5,
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

// Document MiddleWare : runs before .save() and .create()
// Take the tour's name and convert it into a lowercase, URL-friendly slug, then save it in the slug field.
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre("save", function (next) {
	console.log("WIll save document");
	next();
});

tourSchema.post("save", function (doc, next) {
	console.log(doc);
	next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
