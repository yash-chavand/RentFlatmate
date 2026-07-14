const messageRepository = require('../repositories/message.repository');
const chatRoomRepository = require('../repositories/chatRoom.repository');
const ApiError = require('../utils/ApiError');

async function getChatHistory(userId, chatRoomId, query) {
  const chatRoom = await chatRoomRepository.findById(chatRoomId);
  if (!chatRoom) {
    throw ApiError.notFound('Chat room not found');
  }

  const ownerUserId = chatRoom.interestRequest?.listing?.ownerProfile?.userId;
  const tenantUserId = chatRoom.interestRequest?.tenantProfile?.userId;

  if (userId !== ownerUserId && userId !== tenantUserId) {
    throw ApiError.forbidden('You are not authorized to access this chat room history');
  }

  // Optional: Mark unread messages as read when viewing history
  await messageRepository.markRead(chatRoomId, userId);

  return messageRepository.findManyByChatRoomId(chatRoomId, query);
}

module.exports = {
  getChatHistory,
};
