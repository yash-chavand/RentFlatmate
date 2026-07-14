const prisma = require('../config/db');

async function create({ interestRequestId }) {
  return prisma.chatRoom.create({
    data: { interestRequestId },
  });
}

async function findById(id) {
  return prisma.chatRoom.findUnique({
    where: { id },
    include: {
      interestRequest: {
        include: {
          listing: {
            include: {
              ownerProfile: {
                include: { user: true },
              },
            },
          },
          tenantProfile: {
            include: { user: true },
          },
        },
      },
    },
  });
}

async function findByInterestRequestId(interestRequestId) {
  return prisma.chatRoom.findUnique({
    where: { interestRequestId },
  });
}

module.exports = {
  create,
  findById,
  findByInterestRequestId,
};
