const {
  sendErrorDev,
  sendErrorProd,
  sendErrorUnknown,
} = require('./sendError');

exports.sendError = (err, res) => {
  if (process.env.NODE_ENV === 'development')
    return sendErrorDev(err, res);

  // in production
  if (err.isOperational) return sendErrorProd(err, res);

  // unknown error
  sendErrorUnknown(err, res);
};
exports.sendSuccess = (data, statusCode, res, extra = undefined) => {
  if (statusCode === 204)
    return res.status(204).json({
      status: 'success',
      data: null,
    });

  // If I forget to check if the data is exist or not
  // if (!data)
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'data not found',
  //   });

  res.status(statusCode).json({
    status: 'success',
    length: Array.isArray(data) ? data.length : undefined,
    ...extra,
    data,
  });
};
