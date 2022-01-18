const mongoose = require('mongoose');

//Describing our data
//Everything that is not in this schema will simply be ignored when for example we want to make a post request
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
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
    required: [true, 'A tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
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
  startDates: [Date] //different dates at which a tour starts
});

//create a tour of the schema defined
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
