const ownerService = require('../services/owner.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createProfile = asyncHandler(async (req, res) => {
  const profile = await ownerService.createProfile(req.user.id, req.body);
  res.status(201).json(new ApiResponse(profile, 'Owner profile created successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await ownerService.updateProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(profile, 'Owner profile updated successfully'));
});

module.exports = {
  createProfile,
  updateProfile,
};
