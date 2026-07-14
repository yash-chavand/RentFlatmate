const prisma = require('../config/db');

async function create({ tenantProfileId, listingId, status, message }) {
  return prisma.interestRequest.create({
    data: {
      tenantProfileId,
      listingId,
      status,
      message,
    },
  });
}

async function findById(id) {
  return prisma.interestRequest.findUnique({
    where: { id },
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
  });
}

async function findByTenantAndListing(tenantProfileId, listingId) {
  return prisma.interestRequest.findUnique({
    where: {
      tenantProfileId_listingId: {
        tenantProfileId,
        listingId,
      },
    },
  });
}

async function updateStatus(id, status) {
  return prisma.interestRequest.update({
    where: { id },
    data: { status },
  });
}

async function findSentByTenant(tenantProfileId) {
  return prisma.interestRequest.findMany({
    where: { tenantProfileId },
    include: {
      chatRoom: true,
      listing: {
        include: {
          images: true,
          ownerProfile: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findReceivedByOwner(ownerProfileId) {
  return prisma.interestRequest.findMany({
    where: {
      listing: {
        ownerProfileId,
      },
    },
    include: {
      chatRoom: true,
      listing: true,
      tenantProfile: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  create,
  findById,
  findByTenantAndListing,
  updateStatus,
  findSentByTenant,
  findReceivedByOwner,
};
