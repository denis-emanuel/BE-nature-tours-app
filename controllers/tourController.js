const Tour = require('./../models/tourModel');

// https://mongoosejs.com/docs/queries.html

exports.getAllTours = async (req, res) => {
  try {
    //req.query is an object
    console.log(req.query);

    //!BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    //      special words that need to be excluded from the query search in the db
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    //      g = replace all found, not only the first one
    //      we use gte(>=) lte(<=) etc as filters instead of "="
    //      in mongoDB the gte,lte,lt,gt etc should have a "$" before them
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    //      Tour.find() returns a query, so we can chain more methods to it
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      //we pass a second criteria separated with a , for the sort in case there is a tie we'll use the second criteria as a determinator
      const sortBy = req.query.sort.split(',').join(' ');
      //here the sortBy should look something like "price ratingsAverage difficulty" etc
      query = query.sort(sortBy);
    } else {
      //adding a default sort criteria as the ascending date
      query = query.sort('-createdAt');
    }

    // 3) Field limiting -> get back only some fields (great for data heavy data sets)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      //this operation is called projecting:
      query = query.select(fields); //the data should look like 'name duration price'
    } else {
      // by default exclude __v and show everything else, __v is used internally by mongodb
      query = query.select('-__v');
    }

    //!EXECUTE QUERY
    const tours = await query;

    //!SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //.id is the name we've given it in tours routes "/:id"
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    //!the old way of doing the create
    // const newTour = new Tour({})
    // newTour.save()

    //!the new way
    //in this way we call the 'create' method right on the model itself
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    //it enters the catch block only if the request is missing some arguments
    res.status(400).json({
      // 400 = bad request
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
