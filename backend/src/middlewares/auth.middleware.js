const { verifyAccessToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the Bearer access token and attaches req.user = { id, role }.
 * Does NOT hit the database — that's a deliberate tradeoff for speed on
 * every request; deactivated-account checks happen at login/refresh time
 * and in services where ownership actually matters.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired'));
    }
    return next(ApiError.unauthorized('Invalid access token'));
  }
}

function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch (err) {
      // Ignore token errors, let public search load without ranking
    }
  }
  next();
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
