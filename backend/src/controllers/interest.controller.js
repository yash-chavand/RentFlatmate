const interestService = require('../services/interest.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const sendInterest = asyncHandler(async (req, res) => {
  const interest = await interestService.sendInterest(req.user.id, req.body);
  res.status(201).json(new ApiResponse(interest, 'Interest request sent successfully'));
});

const cancelInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interest = await interestService.cancelInterest(req.user.id, id);
  res.status(200).json(new ApiResponse(interest, 'Interest request cancelled successfully'));
});

const acceptInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interest = await interestService.acceptInterest(req.user.id, id);
  res.status(200).json(new ApiResponse(interest, 'Interest request accepted successfully'));
});

const rejectInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interest = await interestService.rejectInterest(req.user.id, id);
  res.status(200).json(new ApiResponse(interest, 'Interest request declined successfully'));
});

const getSentInterests = asyncHandler(async (req, res) => {
  const interests = await interestService.getSentInterests(req.user.id);
  res.status(200).json(new ApiResponse(interests, 'Sent interest requests fetched successfully'));
});

const getReceivedInterests = asyncHandler(async (req, res) => {
  const interests = await interestService.getReceivedInterests(req.user.id);
  res.status(200).json(new ApiResponse(interests, 'Received interest requests fetched successfully'));
});

module.exports = {
  sendInterest,
  cancelInterest,
  acceptInterest,
  rejectInterest,
  getSentInterests,
  getReceivedInterests,
};
