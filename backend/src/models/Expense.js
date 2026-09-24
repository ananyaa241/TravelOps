// backend/src/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  departmentName: {
    type: String,
    default: 'General',
  },
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
  category: {
    type: String,
    required: true,
    enum: ['Flight', 'Hotel', 'Food', 'Taxi', 'Train', 'Fuel', 'Parking', 'Miscellaneous'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  merchant: {
    type: String,
    default: '',
    trim: true,
  },
  receiptUrl: {
    type: String,
    default: '',
  },
  receiptName: {
    type: String,
    default: '',
  },
  policyStatus: {
    type: String,
    enum: ['Within Policy', 'Policy Exception'],
    default: 'Within Policy',
  },
  policyNote: {
    type: String,
    default: '',
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Finance Review', 'Approved', 'Rejected', 'Reimbursed'],
    default: 'Submitted',
    index: true,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  financeReviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  financeReviewDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
