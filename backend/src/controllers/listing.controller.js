const listingService = require('../services/listing.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user.id, req.body);
  res.status(201).json(new ApiResponse(listing, 'Listing created successfully'));
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(listing, 'Listing updated successfully'));
});

const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse({}, 'Listing deleted successfully'));
});

const markAsFilled = asyncHandler(async (req, res) => {
  const listing = await listingService.markAsFilled(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(listing, 'Listing marked as filled'));
});

const searchListings = asyncHandler(async (req, res) => {
  const results = await listingService.searchListings(req.query, req.user);
  res.status(200).json(new ApiResponse(results, 'Listings fetched successfully'));
});

const getListingDetails = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingDetails(req.params.id);
  res.status(200).json(new ApiResponse(listing, 'Listing details fetched successfully'));
});

const getMyListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getMyListings(req.user.id);
  res.status(200).json(new ApiResponse(listings, 'My listings fetched successfully'));
});

const addListingImage = asyncHandler(async (req, res) => {
  const image = await listingService.addListingImage(req.user.id, req.params.id, req.body);
  res.status(201).json(new ApiResponse(image, 'Image added successfully'));
});

const removeListingImage = asyncHandler(async (req, res) => {
  await listingService.removeListingImage(req.user.id, req.params.id, req.params.imageId);
  res.status(200).json(new ApiResponse({}, 'Image removed successfully'));
});

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  markAsFilled,
  searchListings,
  getListingDetails,
  getMyListings,
  addListingImage,
  removeListingImage,
};
