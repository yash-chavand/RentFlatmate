const { verifyAccessToken } = require('../utils/jwt.util');

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};

module.exports = socketAuth;
