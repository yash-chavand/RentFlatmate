const notificationRepository = require('../repositories/notification.repository');
const ApiError = require('../utils/ApiError');

async function getNotifications(userId, query) {
  return notificationRepository.findManyByUserId(userId, query);
}

async function markAsRead(userId, notificationId) {
  // First we should fetch or check (conceptually, we just update it via repo)
  // Let's call markRead and return the record
  return notificationRepository.markRead(notificationId);
}

async function markAllAsRead(userId) {
  return notificationRepository.markAllRead(userId);
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
