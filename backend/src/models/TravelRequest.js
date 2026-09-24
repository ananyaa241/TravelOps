// backend/src/models/TravelRequest.js
const mongoose = require('mongoose');

const travelRequestSchema = new mongoose.Schema({
  requestId: {
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
  employeeEmail: {
    type: String,
    required: true,
  },
  employeeIdCode: {
    type: String,
    default: '',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true,
  },
  departmentName: {
    type: String,
    required: true,
  },
  travelType: {
    type: String,
    enum: ['Domestic', 'International', 'Business Conference', 'Client Visit', 'Training', 'Site Visit', 'Other'],
    default: 'Domestic',
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
  },
  origin: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  durationDays: {
    type: Number,
    default: 1,
  },
  travelersCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  estimatedAccommodationCost: {
    type: Number,
    default: 0,
  },
  estimatedTransportationCost: {
    type: Number,
    default: 0,
  },
  estimatedMealsCost: {
    type: Number,
    default: 0,
  },
  estimatedOtherCost: {
    type: Number,
    default: 0,
  },
  estimatedTotalCost: {
    type: Number,
    required: true,
    default: 0,
  },
  advanceRequested: {
    type: Number,
    default: 0,
  },
  businessCode: {
    type: String,
    default: 'PRJ-GENERAL',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Policy Review',
      'Pending Manager Approval',
      'Pending Additional Approval',
      'Approved',
      'Rejected',
      'Booking In Progress',
      'Booked',
      'Completed',
      'Cancelled',
    ],
    default: 'Submitted',
    index: true,
  },
  policyStatus: {
    type: String,
    enum: ['Within Policy', 'Policy Exception'],
    default: 'Within Policy',
  },
  policyViolations: [{
    rule: String,
    category: String,
    requestedAmount: Number,
    allowedAmount: Number,
    difference: Number,
    description: String,
  }],
  currentApprovalLevel: {
    type: Number,
    default: 1,
  },
  approvalChain: [{
    level: Number,
    role: String,
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approverName: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Changes Requested'],
      default: 'Pending',
    },
    comment: String,
    actionDate: Date,
  }],
  rejectionReason: {
    type: String,
    default: '',
  },
  bookingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  expensesSubmitted: {
    type: Boolean,
    default: false,
  },
  totalActualExpense: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Auto-calculate duration and total cost pre-save
travelRequestSchema.pre('save', function (next) {
  if (this.departureDate && this.returnDate) {
    const diffTime = Math.abs(new Date(this.returnDate) - new Date(this.departureDate));
    this.durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
  this.estimatedTotalCost = (this.estimatedAccommodationCost || 0) +
                            (this.estimatedTransportationCost || 0) +
                            (this.estimatedMealsCost || 0) +
                            (this.estimatedOtherCost || 0);
  next();
});

module.exports = mongoose.model('TravelRequest', travelRequestSchema);
