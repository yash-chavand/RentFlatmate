const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getUsers = asyncHandler(async (req, res) => {
  const data = await adminService.getUsers();
  res.status(200).json(new ApiResponse(data, 'Users fetched successfully'));
});

const getListings = asyncHandler(async (req, res) => {
  const data = await adminService.getListings();
  res.status(200).json(new ApiResponse(data, 'Listings fetched successfully'));
});

const getLogs = asyncHandler(async (req, res) => {
  const data = await adminService.getLogs();
  res.status(200).json(new ApiResponse(data, 'Audit logs fetched successfully'));
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await adminService.deactivateUser(req.user.id, req.params.id, isActive);
  res.status(200).json(new ApiResponse(user, `User status updated successfully`));
});

const deleteListing = asyncHandler(async (req, res) => {
  const result = await adminService.deleteListing(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(result, 'Listing deleted successfully by administrator'));
});

module.exports = {
  getUsers,
  getListings,
  getLogs,
  deactivateUser,
  deleteListing,
};
