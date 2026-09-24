// backend/src/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({
  recipientId,
  role = null,
  title,
  message,
  type = 'SYSTEM',
  link = '',
  metadata = {},
}) => {
  try {
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        link,
        metadata,
      });
    } else if (role) {
      // Broadcast to all users of a specific role (e.g. all FINANCE OFFICER or TRAVEL COORDINATOR)
      const users = await User.find({ role, isActive: true }).select('_id');
      const notifications = users.map(u => ({
        recipient: u._id,
        title,
        message,
        type,
        link,
        metadata,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
