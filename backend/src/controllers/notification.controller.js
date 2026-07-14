const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user.id, req.query);
  res.status(200).json(new ApiResponse(result, 'Notifications fetched successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(req.user.id, id);
  res.status(200).json(new ApiResponse(notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json(new ApiResponse(result, 'All notifications marked as read'));
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
