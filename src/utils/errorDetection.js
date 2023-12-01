const AppError = require('./AppError');

module.exports = errorDetection = (err) => {
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  }
  // MongoDB validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return new AppError(messages.join(', '), 400);
  }

  // Duplicate User email
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];
    return new AppError(`Duplicate field value: ${duplicatedField}`, 409);
  }

  // Image
  if (err.code === 'LIMIT_UNEXPECTED_FILE')
    return new AppError(
      `${err.message}: ${err.field}, expected 'image' or 'secondImage'`,
      400
    );
  // JWT token expired
  if (err.name === 'TokenExpiredError')
    return new AppError('Token expired, Please login again', 401);

  // JWT token invalid
  if (err.name === 'JsonWebTokenError')
    return new AppError('Invalid token', 401);

  if (err.type === 'entity.parse.failed')
    return new AppError(
      'Syntax Error: The body was not written in JSON correctly',
      400
    );
  return err;
};
