const prisma = require('../config/db');

async function create({ chatRoomId, senderId, content }) {
  return prisma.message.create({
    data: {
      chatRoomId,
      senderId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

async function findManyByChatRoomId(chatRoomId, { page = 1, limit = 50 } = {}) {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { chatRoomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.message.count({ where: { chatRoomId } }),
  ]);

  return {
    messages,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
}

async function markRead(chatRoomId, userId, readAt = new Date()) {
  return prisma.message.updateMany({
    where: {
      chatRoomId,
      senderId: { not: userId },
      readAt: null,
    },
    data: {
      readAt,
    },
  });
}

module.exports = {
  create,
  findManyByChatRoomId,
  markRead,
};
