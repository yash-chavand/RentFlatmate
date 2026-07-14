const prisma = require('../config/db');

async function create({ actorId, action, target, metadata }) {
  return prisma.adminLog.create({
    data: {
      actorId,
      action,
      target,
      metadata: metadata || undefined,
    },
  });
}

async function findMany({ page = 1, limit = 50 } = {}) {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.adminLog.count(),
  ]);

  return {
    logs,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
}

module.exports = {
  create,
  findMany,
};
