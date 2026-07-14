const prisma = require('../config/db');

async function create({ userId, type, title, body, metadata }) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: metadata || undefined,
    },
  });
}

async function findManyByUserId(userId, { page = 1, limit = 20 } = {}) {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
}

async function markRead(id) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

async function markAllRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

module.exports = {
  create,
  findManyByUserId,
  markRead,
  markAllRead,
};
