const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const handler = (req, res, next) => {
  next(new ApiError(429, 'Too many requests, please try again later'));
};

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 10000 : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Auth endpoints (login/register especially) get a tighter limit to slow
// down credential-stuffing / brute-force attempts.
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 1000 : env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = { globalLimiter, authLimiter };
