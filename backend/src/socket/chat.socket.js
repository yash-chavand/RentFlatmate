const chatRoomRepository = require('../repositories/chatRoom.repository');
const messageRepository = require('../repositories/message.repository');
const logger = require('../utils/logger');

function handleChat(io, socket) {
  socket.on('room:join', async ({ chatRoomId }) => {
    try {
      if (!chatRoomId) return;

      // Validate room participation
      const room = await chatRoomRepository.findById(chatRoomId);
      if (!room) {
        logger.warn(`Socket ${socket.id} tried to join non-existent room: ${chatRoomId}`);
        return;
      }

      const ownerUserId = room.interestRequest?.listing?.ownerProfile?.userId;
      const tenantUserId = room.interestRequest?.tenantProfile?.userId;

      if (socket.user.id !== ownerUserId && socket.user.id !== tenantUserId) {
        logger.warn(`Unauthorized room join attempt: user ${socket.user.id} tried to join room ${chatRoomId}`);
        return;
      }

      socket.join(chatRoomId);
      logger.info(`User ${socket.user.id} joined chat room: ${chatRoomId}`);
    } catch (err) {
      logger.error(`Error in room:join socket event:`, err);
    }
  });

  socket.on('room:leave', ({ chatRoomId }) => {
    if (!chatRoomId) return;
    socket.leave(chatRoomId);
    logger.info(`User ${socket.user.id} left chat room: ${chatRoomId}`);
  });

  socket.on('message:send', async ({ chatRoomId, content }) => {
    try {
      if (!chatRoomId || !content || !content.trim()) return;

      // Verify that this socket is indeed in the room
      const rooms = Array.from(socket.rooms);
      if (!rooms.includes(chatRoomId)) {
        logger.warn(`User ${socket.user.id} tried to send message to room ${chatRoomId} without joining`);
        return;
      }

      // Persist message to database
      const message = await messageRepository.create({
        chatRoomId,
        senderId: socket.user.id,
        content: content.trim(),
      });

      // Broadcast message to everyone in the room (including sender)
      io.to(chatRoomId).emit('message:new', { message });
    } catch (err) {
      logger.error(`Error in message:send socket event:`, err);
    }
  });

  socket.on('typing:start', ({ chatRoomId }) => {
    if (!chatRoomId) return;
    // Broadcast to everyone else in the room
    socket.to(chatRoomId).emit('typing:update', {
      userId: socket.user.id,
      isTyping: true,
    });
  });

  socket.on('typing:stop', ({ chatRoomId }) => {
    if (!chatRoomId) return;
    // Broadcast to everyone else in the room
    socket.to(chatRoomId).emit('typing:update', {
      userId: socket.user.id,
      isTyping: false,
    });
  });
}

module.exports = handleChat;
