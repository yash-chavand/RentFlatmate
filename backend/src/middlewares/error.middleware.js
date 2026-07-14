const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Single place that turns any thrown error (ApiError or otherwise) into a
 * consistent JSON response. Must be registered last, after all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Unexpected errors (bugs, driver failures) are logged with full detail
    // but never leak internals to the client.
    logger.error(err);
    error = ApiError.internal('Something went wrong');
  } else if (!error.isOperational) {
    logger.error(err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${error.statusCode} ${error.message}`);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
}

module.exports = errorMiddleware;
