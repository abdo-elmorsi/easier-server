exports.sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

exports.sendErrorProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

exports.sendErrorUnknown = (err, res) => {
  console.error('Error: ', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};
