const prisma = require('../config/db');

async function create({
  userId,
  preferredLocation,
  budgetMin,
  budgetMax,
  moveInDate,
  roomTypePreference,
  furnishedPref,
  bio,
}) {
  return prisma.tenantProfile.create({
    data: {
      userId,
      preferredLocation,
      budgetMin,
      budgetMax,
      moveInDate: new Date(moveInDate),
      roomTypePreference,
      furnishedPref,
      bio,
    },
  });
}

async function findByUserId(userId) {
  return prisma.tenantProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

async function update(userId, data) {
  const updateData = { ...data };
  if (updateData.moveInDate) {
    updateData.moveInDate = new Date(updateData.moveInDate);
  }
  return prisma.tenantProfile.update({
    where: { userId },
    data: updateData,
  });
}

module.exports = {
  create,
  findByUserId,
  update,
};
