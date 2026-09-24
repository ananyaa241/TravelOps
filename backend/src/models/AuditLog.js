// backend/src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    default: 'EMPLOYEE',
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  entity: {
    type: String,
    required: true,
    enum: ['TRAVEL_REQUEST', 'APPROVAL', 'BOOKING', 'ITINERARY', 'EXPENSE', 'REIMBURSEMENT', 'POLICY', 'USER', 'DEPARTMENT', 'VENDOR'],
    index: true,
  },
  entityId: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
