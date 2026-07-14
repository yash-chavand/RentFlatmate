const compatibilityRepository = require('../repositories/compatibility.repository');
const tenantProfileRepository = require('../repositories/tenantProfile.repository');
const listingRepository = require('../repositories/listing.repository');
const { computeAICompatibility } = require('../ai/compatibility.engine');
const { computeFallbackCompatibility } = require('../ai/fallback.engine');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

async function getOrComputeCompatibility(tenantUserId, listingId) {
  // 1. Fetch tenant profile
  const tenantProfile = await tenantProfileRepository.findByUserId(tenantUserId);
  if (!tenantProfile) {
    throw ApiError.notFound('Tenant profile required. Please configure your profile first to calculate compatibility.');
  }

  // 2. Check cache
  const cached = await compatibilityRepository.findByTenantAndListing(tenantProfile.id, listingId);
  if (cached) {
    logger.info(`Compatibility cache HIT for Tenant Profile: ${tenantProfile.id} and Listing: ${listingId}`);
    return cached;
  }

  logger.info(`Compatibility cache MISS for Tenant Profile: ${tenantProfile.id} and Listing: ${listingId}. Computing...`);

  // 3. Fetch listing
  const listing = await listingRepository.findById(listingId);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  let result = null;
  let source = 'GEMINI';

  // 4. Try AI engine, fallback to rule-based calculation
  try {
    result = await computeAICompatibility(tenantProfile, listing);
    logger.info(`Successfully calculated AI compatibility score: ${result.score}`);
  } catch (err) {
    logger.warn(`AI compatibility computation failed. Falling back to rule-based engine. Reason: ${err.message}`);
    result = computeFallbackCompatibility(tenantProfile, listing);
    source = 'FALLBACK';
  }

  // 5. Store in database
  const compatibility = await compatibilityRepository.create({
    tenantProfileId: tenantProfile.id,
    listingId,
    score: result.score,
    explanation: result.explanation,
    pros: result.pros,
    cons: result.cons,
    source,
  });

  // 6. Trigger high compatibility actions if score > 80
  if (compatibility.score >= 80) {
    logger.info(`🚨 HIGH COMPATIBILITY Alert (Score: ${compatibility.score}) between Tenant Profile: ${tenantProfile.id} and Listing: ${listingId}`);
    // Email triggers Resend client placeholder can go here
  }

  return compatibility;
}

module.exports = {
  getOrComputeCompatibility,
};
