const tenantService = require('../services/tenant.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createProfile = asyncHandler(async (req, res) => {
  const profile = await tenantService.createProfile(req.user.id, req.body);
  res.status(201).json(new ApiResponse(profile, 'Tenant profile created successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await tenantService.updateProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(profile, 'Tenant profile updated successfully'));
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await tenantService.getProfileByUserId(req.user.id);
  res.status(200).json(new ApiResponse(profile, 'Tenant profile fetched successfully'));
});

module.exports = {
  createProfile,
  updateProfile,
  getProfile,
};
