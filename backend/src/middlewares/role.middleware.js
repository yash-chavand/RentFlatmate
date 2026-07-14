const ApiError = require('../utils/ApiError');

/**
 * Usage: router.patch('/listings/:id/fill', authenticate, authorize('OWNER'), controller)
 * Ownership checks beyond role (e.g. "is this YOUR listing") belong in the
 * service layer, not here — this only checks the coarse role claim.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

module.exports = authorize;
