const mongoose = require("mongoose");

class APIFeatures {
  constructor(query, queryOptions) {
    this.query = query;
    this.queryOptions = queryOptions;
  }

  isNumericField(model, fieldName) {
    const schema = model.schema;
    const fieldPath = schema.path(fieldName);
    return fieldPath && fieldPath instanceof mongoose.Schema.Types.Number;
  }

  filter() {
    const queryObj = { ...this.queryOptions };
    const excludedFields = ['select', 'sort', 'filters', 'page', 'limit', 'search', 'searchFields'];

    // Remove excluded fields from query options
    excludedFields.forEach((field) => delete queryObj[field]);

    // Apply basic filters to query
    this.query = this.query.find(queryObj);
    return this;
  }

  filters() {
    const { filters } = this.queryOptions;

    // Apply additional filters to query if filters option is provided
    if (filters) {
      const filter = filters.split(',').map((filter) => {
        const [field, value] = filter.split('=');
        return { [field]: value };
      });

      this.query = this.query.and(filter);
    }

    return this;
  }

  sort() {
    const { sort } = this.queryOptions;

    // Apply sorting to query if sort option is provided
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  select() {
    const { select } = this.queryOptions;

    // Apply field selection to query if select option is provided
    if (select) {
      if (select.includes('password')) {
        throw new Error('Invalid selected fields in query');
      }
      this.query = this.query.select(select.split(',').join(' '));
    }

    return this;
  }

  search() {
    const { search, searchFields } = this.queryOptions;

    // Apply search to query if search option is provided
    if (search && searchFields) {
      const searchQueries = searchFields.map((field) => {
        // Check if the field is numeric before applying the regular expression
        const isNumericField = this.isNumericField(this.query.model, field);
        const regexValue = isNumericField ? parseFloat(search) : new RegExp(search, 'i');

        return {
          [field]: isNumericField ? regexValue : { $regex: regexValue },
        };
      });
      this.query = this.query.or(searchQueries);
    }

    return this;
  }

  paginate() {
    const page = +this.queryOptions.page || 1;
    const limit = +this.queryOptions.limit || 10;
    const skip = (page - 1) * limit;

    // Apply pagination to query
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getQuery() {
    return this.query;
  }
}

module.exports = APIFeatures;