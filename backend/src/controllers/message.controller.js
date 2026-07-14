const messageService = require('../services/message.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getChatHistory = asyncHandler(async (req, res) => {
  const { chatRoomId } = req.params;
  const result = await messageService.getChatHistory(req.user.id, chatRoomId, req.query);
  res.status(200).json(new ApiResponse(result, 'Chat history messages fetched successfully'));
});

module.exports = {
  getChatHistory,
};
