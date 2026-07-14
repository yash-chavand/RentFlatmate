const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return { users };
}

async function getListings() {
  const listings = await prisma.listing.findMany({
    include: {
      ownerProfile: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return { listings };
}

async function getLogs() {
  const logs = await prisma.adminLog.findMany({
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
  });
  return { logs };
}

async function deactivateUser(adminUserId, targetUserId, isActive) {
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }

  if (targetUser.role === 'ADMIN') {
    throw ApiError.badRequest('Admin users cannot be deactivated');
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    select: { id: true, name: true, isActive: true },
  });

  // Log action
  await prisma.adminLog.create({
    data: {
      actorId: adminUserId,
      action: isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      target: targetUser.email,
      metadata: { userId: targetUserId },
    },
  });

  return updatedUser;
}

async function deleteListing(adminUserId, listingId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  await prisma.listing.delete({ where: { id: listingId } });

  // Log action
  await prisma.adminLog.create({
    data: {
      actorId: adminUserId,
      action: 'LISTING_DELETE',
      target: listing.title,
      metadata: { listingId },
    },
  });

  return { success: true };
}

module.exports = {
  getUsers,
  getListings,
  getLogs,
  deactivateUser,
  deleteListing,
};
