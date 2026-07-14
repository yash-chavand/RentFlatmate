const prisma = require('../config/db');

async function create({ userId, bio, govIdUrl }) {
  return prisma.ownerProfile.create({
    data: { userId, bio, govIdUrl },
  });
}

async function findByUserId(userId) {
  return prisma.ownerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

async function update(userId, data) {
  return prisma.ownerProfile.update({
    where: { userId },
    data,
  });
}

module.exports = {
  create,
  findByUserId,
  update,
};
