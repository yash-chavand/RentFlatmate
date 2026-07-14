const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Access tokens are short-lived and carry the claims controllers/middleware
 * need (sub, role). Refresh tokens are opaque-ish (just sub + a random jti)
 * and are cross-checked against the hashed value stored in RefreshToken.
 */
function signAccessToken({ id, role }) {
  return jwt.sign({ sub: id, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

function signRefreshToken({ id }) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: id, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Refresh tokens are stored hashed (never in plaintext) so a DB leak alone
 * can't be replayed. This is a fast, non-secret-keyed hash — it's fine here
 * because the token itself already has high entropy (it's a signed JWT).
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
