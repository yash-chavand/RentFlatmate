const prisma = require('../config/db');

async function create({
  ownerProfileId,
  title,
  description,
  location,
  rent,
  deposit = 0,
  availableDate,
  roomType,
  furnished,
}) {
  return prisma.listing.create({
    data: {
      ownerProfileId,
      title,
      description,
      location,
      rent: parseInt(rent, 10),
      deposit: parseInt(deposit, 10),
      availableDate: new Date(availableDate),
      roomType,
      furnished: furnished === 'true' || furnished === true,
    },
  });
}

async function findById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      images: true,
      ownerProfile: {
        include: {
          user: true,
        },
      },
    },
  });
}

async function findMany({
  location,
  minRent,
  maxRent,
  roomType,
  furnished,
  availableAfter,
  status = 'AVAILABLE',
  page = 1,
  limit = 10,
}) {
  const where = { status };

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  if (minRent !== undefined || maxRent !== undefined) {
    where.rent = {};
    if (minRent !== undefined) where.rent.gte = parseInt(minRent, 10);
    if (maxRent !== undefined) where.rent.lte = parseInt(maxRent, 10);
  }

  if (roomType) {
    where.roomType = roomType;
  }

  if (furnished !== undefined) {
    where.furnished = furnished === 'true' || furnished === true;
  }

  if (availableAfter) {
    where.availableDate = {
      gte: new Date(availableAfter),
    };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: true,
        ownerProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
}

async function findManyByOwnerProfileId(ownerProfileId) {
  return prisma.listing.findMany({
    where: { ownerProfileId },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function update(id, data) {
  const updateData = { ...data };
  if (updateData.rent !== undefined) {
    updateData.rent = parseInt(updateData.rent, 10);
  }
  if (updateData.deposit !== undefined) {
    updateData.deposit = parseInt(updateData.deposit, 10);
  }
  if (updateData.availableDate !== undefined) {
    updateData.availableDate = new Date(updateData.availableDate);
  }
  if (updateData.furnished !== undefined) {
    updateData.furnished = updateData.furnished === 'true' || updateData.furnished === true;
  }
  return prisma.listing.update({
    where: { id },
    data: updateData,
    include: { images: true },
  });
}

async function deleteListing(id) {
  return prisma.listing.delete({
    where: { id },
  });
}

async function updateStatus(id, status) {
  return prisma.listing.update({
    where: { id },
    data: { status },
  });
}

module.exports = {
  create,
  findById,
  findMany,
  findManyByOwnerProfileId,
  update,
  delete: deleteListing,
  updateStatus,
};
