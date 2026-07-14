const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');
const socketAuth = require('./socketAuth');
const { handlePresence } = require('./presence.socket');
const handleChat = require('./chat.socket');

let ioInstance = null;

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  // Scope connections to the chat namespace
  const chatNamespace = io.of('/chat');

  // Handshake token validation middleware
  chatNamespace.use(socketAuth);

  chatNamespace.on('connection', (socket) => {
    logger.info(`Socket connected to /chat: ${socket.id} (User: ${socket.user.id}, Role: ${socket.user.role})`);

    // Register presence handler
    handlePresence(chatNamespace, socket);

    // Register chat room events handler
    handleChat(chatNamespace, socket);

    socket.on('error', (err) => {
      logger.error(`Socket error on ID ${socket.id}:`, err);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected from /chat: ${socket.id} (User: ${socket.user.id})`);
    });
  });

  logger.info('Socket.io server initialized and attached to HTTP server.');
  return io;
}

function getIo() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized. Call initSocket(server) first.');
  }
  return ioInstance;
}

module.exports = {
  initSocket,
  getIo,
};
