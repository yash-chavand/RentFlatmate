const compatibilityService = require('../services/compatibility.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getCompatibility = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const compatibility = await compatibilityService.getOrComputeCompatibility(req.user.id, listingId);
  res.status(200).json(new ApiResponse(compatibility, 'Compatibility score fetched successfully'));
});

module.exports = {
  getCompatibility,
};
