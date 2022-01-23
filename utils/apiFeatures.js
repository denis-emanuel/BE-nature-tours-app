class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    //      special words that need to be excluded from the query search in the db
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    //      g = replace all found, not only the first one
    //      we use gte(>=) lte(<=) etc as filters instead of "="
    //      in mongoDB the gte,lte,lt,gt etc should have a "$" before them
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    //return the entire object so we can chain all the methods together
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //we pass a second criteria separated with a , for the sort in case there is a tie we'll use the second criteria as a determinator
      const sortBy = this.queryString.sort.split(',').join(' ');
      //here the sortBy should look something like "price ratingsAverage difficulty" etc
      this.query = this.query.sort(sortBy);
    } else {
      //adding a default sort criteria as the ascending date
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //this operation is called projecting:
      this.query = this.query.select(fields); //the data should look like 'name duration price'
    } else {
      // by default exclude __v and show everything else, __v is used internally by mongodb
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //the amount of results that should be skipped before querrying the data, and the limit of results we get back
    // page=3&limit=10 => skip(20).limit(10);
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
