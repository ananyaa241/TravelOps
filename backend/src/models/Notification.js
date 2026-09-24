// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TRAVEL_APPROVAL', 'POLICY_EXCEPTION', 'BOOKING_UPDATE', 'EXPENSE_UPDATE', 'REIMBURSEMENT_PAID', 'SYSTEM'],
    default: 'SYSTEM',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  link: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
