// backend/src/models/ApprovalRule.js
const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
  },
  minAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  maxAmount: {
    type: Number,
    required: true,
    default: 25000,
  },
  requiredApprovalLevels: [{
    level: Number,
    role: {
      type: String,
      enum: ['MANAGER', 'FINANCE OFFICER', 'COMPANY ADMIN'],
      required: true,
    },
    label: String,
  }],
  requiresPolicyExceptionApproval: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
