const ownerProfileRepository = require('../repositories/ownerProfile.repository');
const ApiError = require('../utils/ApiError');

async function createProfile(userId, { bio, govIdUrl }) {
  const existing = await ownerProfileRepository.findByUserId(userId);
  if (existing) {
    throw ApiError.badRequest('Owner profile already exists for this account');
  }

  return ownerProfileRepository.create({
    userId,
    bio,
    govIdUrl,
  });
}

async function updateProfile(userId, data) {
  const existing = await ownerProfileRepository.findByUserId(userId);
  if (!existing) {
    throw ApiError.notFound('Owner profile not found. Please create one first.');
  }

  return ownerProfileRepository.update(userId, data);
}

async function getProfileByUserId(userId) {
  return ownerProfileRepository.findByUserId(userId);
}

module.exports = {
  createProfile,
  updateProfile,
  getProfileByUserId,
};
