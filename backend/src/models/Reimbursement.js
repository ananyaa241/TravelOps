// backend/src/models/Reimbursement.js
const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
  reimbursementId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  departmentName: {
    type: String,
    default: 'Engineering',
  },
  travelRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelRequest',
    required: true,
  },
  requestId: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    default: '',
  },
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
  }],
  totalClaimedAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  approvedAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  advanceDeducted: {
    type: Number,
    default: 0,
  },
  netPayableAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer (NEFT/RTGS)', 'Corporate Card Credit', 'UPI Direct', 'Payroll Adjustment'],
    default: 'Bank Transfer (NEFT/RTGS)',
  },
  paymentReference: {
    type: String,
    default: '',
    trim: true,
  },
  processingDate: {
    type: Date,
  },
  financeOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  financeOfficerName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Processing', 'Paid', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  remarks: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
