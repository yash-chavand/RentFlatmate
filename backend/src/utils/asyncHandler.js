/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * next(err) automatically, letting error.middleware.js be the single place
 * that formats error responses.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
