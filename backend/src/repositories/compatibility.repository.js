const prisma = require('../config/db');

async function create({
  tenantProfileId,
  listingId,
  score,
  explanation,
  pros,
  cons,
  source,
}) {
  return prisma.compatibility.create({
    data: {
      tenantProfileId,
      listingId,
      score: parseInt(score, 10),
      explanation,
      pros,
      cons,
      source,
    },
  });
}

async function findByTenantAndListing(tenantProfileId, listingId) {
  return prisma.compatibility.findUnique({
    where: {
      tenantProfileId_listingId: {
        tenantProfileId,
        listingId,
      },
    },
  });
}

module.exports = {
  create,
  findByTenantAndListing,
};
