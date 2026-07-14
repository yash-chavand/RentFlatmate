const prisma = require('../config/db');

async function create({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

async function findByHash(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

async function revokeByHash(tokenHash, replacedByHash = null) {
  return prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date(), replacedBy: replacedByHash },
  });
}

async function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  create,
  findByHash,
  revokeByHash,
  revokeAllForUser,
};
