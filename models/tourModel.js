const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//Describing our data
//Everything that is not in this schema will simply be ignored when for example we want to make a post request
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name must have less or equal than 40 characters'],
      minlength: [5, 'Name must have more or equal than 5 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating is 1.0'],
      max: [5, 'Rating has a maximum value of 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          //price discount can't be higher than the price
          //the "this" keyword only works when creating documents, not when updating them
          return value < this.price;
        },
        message: 'Price discount ({VALUE}) higher than the actual price'
      }
    },
    summary: {
      type: String,
      trim: true, //remove all the white spaces from the beginning and the end
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String], //an array of strings with all the images from one specific tour
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //won't appear when querrying for all the data
    },
    startDates: [Date], //different dates at which a tour starts
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true }, //the virtuals will be part of the output
    toObject: { virtuals: true }
  }
);

//! VIRTUAL
//this virtual property can not be used in queries
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
  //using a regular function in order to use the this keyword
  //this -> current document
}); //this virtual property will be created each time that we get some data out of the database

//!DOCUMENT MIDDLEWARE
//this is a DOCUMENT MIDDLEWARE that will run before an actual event, in this case the 'save' (.save()) event, but will not work for update
//ALSO CALLED PRE SAVE HOOK:
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//this runs after the .save(), so it no longer has access to the "this" but we have access to the finished document
//POST SAVE HOOK:
tourSchema.post('save', function(doc, next) {
  next();
});

//!QUERY MIDDLEWARE
//here this will point at the current query
//reges for all the strings that start with find, find(), findById, etc.
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start}ms`);
  next();
});

//!AGGREGATION MIDDLEWARE
//this -> current aggregation model
tourSchema.pre('aggregate', function(next) {
  //add a match pipeline right at the beginning of the array of aggregation to filter out the secret tours
  //this is done because we want to filter all secret tours out so we don't want to repeat this statement at every 'match' because the code becomes repetitive
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//create a tour of the schema defined
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
