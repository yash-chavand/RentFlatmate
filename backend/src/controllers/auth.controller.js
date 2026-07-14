const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = env.JWT_REFRESH_COOKIE_NAME;

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1/auth', // scope the cookie to auth endpoints only
};

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
}

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json(new ApiResponse({ user, accessToken }, 'Account created successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json(new ApiResponse({ user, accessToken }, 'Logged in successfully'));
});

const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refresh({
    refreshToken: incomingToken,
  });
  setRefreshCookie(res, refreshToken);
  res.status(200).json(new ApiResponse({ user, accessToken }, 'Token refreshed'));
});

const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout({ refreshToken: incomingToken });
  clearRefreshCookie(res);
  res.status(200).json(new ApiResponse({}, 'Logged out successfully'));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json(new ApiResponse({ user }, 'Current user'));
});

module.exports = { register, login, refresh, logout, me };
