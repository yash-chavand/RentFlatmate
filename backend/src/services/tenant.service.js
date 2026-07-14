const tenantProfileRepository = require('../repositories/tenantProfile.repository');
const compatibilityService = require('./compatibility.service');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

// Asynchronous background precomputation worker
async function precomputeTopListings(userId) {
  try {
    // Get up to 15 active listings
    const listings = await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      take: 15,
      select: { id: true }
    });

    for (const listing of listings) {
      // getOrComputeCompatibility checks cache first, so it won't duplicate requests
      await compatibilityService.getOrComputeCompatibility(userId, listing.id).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to precompute compatibility scores in background:', err);
  }
}

async function createProfile(userId, { preferredLocation, budgetMin, budgetMax, moveInDate, roomTypePreference, furnishedPref, bio }) {
  const existing = await tenantProfileRepository.findByUserId(userId);
  if (existing) {
    throw ApiError.badRequest('Tenant profile already exists for this account');
  }

  const profile = await tenantProfileRepository.create({
    userId,
    preferredLocation,
    budgetMin,
    budgetMax,
    moveInDate,
    roomTypePreference,
    furnishedPref,
    bio,
  });

  // Run compatibility precomputations in background
  precomputeTopListings(userId);

  return profile;
}

async function updateProfile(userId, data) {
  const existing = await tenantProfileRepository.findByUserId(userId);
  if (!existing) {
    throw ApiError.notFound('Tenant profile not found. Please create one first.');
  }

  const profile = await tenantProfileRepository.update(userId, data);

  // Clear existing compatibility cache for this tenant since preferences changed!
  await prisma.compatibility.deleteMany({
    where: { tenantProfileId: profile.id }
  }).catch(() => {});

  // Precompute again in the background with new parameters
  precomputeTopListings(userId);

  return profile;
}

async function getProfileByUserId(userId) {
  return tenantProfileRepository.findByUserId(userId);
}

module.exports = {
  createProfile,
  updateProfile,
  getProfileByUserId,
};
