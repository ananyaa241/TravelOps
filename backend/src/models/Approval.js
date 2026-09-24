// backend/src/models/Approval.js
const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  travelRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelRequest',
    required: true,
    index: true,
  },
  requestId: {
    type: String,
    required: true,
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approverName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['MANAGER', 'FINANCE OFFICER', 'COMPANY ADMIN', 'TRAVEL COORDINATOR'],
  },
  level: {
    type: Number,
    default: 1,
  },
  decision: {
    type: String,
    required: true,
    enum: ['Approved', 'Rejected', 'Changes Requested'],
  },
  comment: {
    type: String,
    default: '',
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
