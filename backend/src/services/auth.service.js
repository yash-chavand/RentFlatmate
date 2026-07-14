const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const ownerProfileRepository = require('../repositories/ownerProfile.repository');
const tenantProfileRepository = require('../repositories/tenantProfile.repository');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const ALLOWED_SELF_REGISTER_ROLES = ['OWNER', 'TENANT']; // ADMIN is provisioned out-of-band, never self-registered

function msFromExpiry(expiry) {
  // Supports the same shorthand jsonwebtoken accepts (e.g. '7d', '15m').
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // sane fallback: 7 days
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * unitMs[unit];
}

/**
 * Issues a fresh access + refresh token pair for a user, persisting the
 * hashed refresh token so it can be revoked later (logout, rotation).
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const { token: refreshToken } = signRefreshToken({ id: user.id });

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + msFromExpiry(env.JWT_REFRESH_EXPIRY));

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

async function register({ email, password, role, name, phone }) {
  if (!ALLOWED_SELF_REGISTER_ROLES.includes(role)) {
    throw ApiError.badRequest('role must be one of OWNER, TENANT');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await userRepository.create({
    email,
    password: hashedPassword,
    role,
    name,
    phone,
  });

  if (role === 'OWNER') {
    try {
      await ownerProfileRepository.create({ userId: user.id });
    } catch (err) {
      console.error('Failed to auto-create Owner profile during registration:', err);
    }
  } else if (role === 'TENANT') {
    try {
      await tenantProfileRepository.create({
        userId: user.id,
        preferredLocation: 'Not Specified',
        budgetMin: 0,
        budgetMax: 5000,
        moveInDate: new Date(),
        roomTypePreference: 'SINGLE',
        furnishedPref: false,
        bio: '',
      });
    } catch (err) {
      console.error('Failed to auto-create Tenant profile during registration:', err);
    }
  }

  const tokens = await issueTokenPair(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user);
  return { user: sanitizeUser(user), ...tokens };
}

/**
 * Rotates a refresh token: the incoming token is verified, checked against
 * the stored hash (must exist and not be revoked/expired), then revoked and
 * replaced with a brand new pair. Rotation (rather than reusing the same
 * refresh token indefinitely) limits the blast radius of a leaked token.
 */
async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findByHash(tokenHash);

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token is invalid or expired');
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not available');
  }

  const tokens = await issueTokenPair(user);
  await refreshTokenRepository.revokeByHash(tokenHash, hashToken(tokens.refreshToken));

  return { user: sanitizeUser(user), ...tokens };
}

async function logout({ refreshToken }) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findByHash(tokenHash);
  if (stored && !stored.revokedAt) {
    await refreshTokenRepository.revokeByHash(tokenHash);
  }
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = { register, login, refresh, logout, getMe };
