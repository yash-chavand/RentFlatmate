const prisma = require('../config/db');

async function create({ listingId, url, publicId }) {
  return prisma.listingImage.create({
    data: { listingId, url, publicId },
  });
}

async function findById(id) {
  return prisma.listingImage.findUnique({
    where: { id },
  });
}

async function deleteImage(id) {
  return prisma.listingImage.delete({
    where: { id },
  });
}

module.exports = {
  create,
  findById,
  delete: deleteImage,
};
