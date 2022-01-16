const mongoose = require('mongoose');

//Describing our data
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'Must have a price']
  }
});

//create a tour of the schema defined
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
