// backend/src/models/TravelPolicy.js
const mongoose = require('mongoose');

const travelPolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null, // null means organization-wide default
  },
  departmentName: {
    type: String,
    default: 'All Departments',
  },
  travelType: {
    type: String,
    enum: ['All', 'Domestic', 'International', 'Business Conference', 'Client Visit', 'Training', 'Site Visit', 'Other'],
    default: 'All',
  },
  hotelMaxPerNight: {
    type: Number,
    required: true,
    default: 8000, // ₹8,000 / night
  },
  mealsMaxPerDay: {
    type: Number,
    required: true,
    default: 2000, // ₹2,000 / day
  },
  transportMaxPerDay: {
    type: Number,
    default: 3000, // ₹3,000 / day
  },
  flightClassDomestic: {
    type: String,
    enum: ['Economy', 'Premium Economy', 'Business'],
    default: 'Economy',
  },
  flightClassInternational: {
    type: String,
    enum: ['Economy', 'Premium Economy', 'Business', 'First'],
    default: 'Economy',
  },
  advanceLimitPercentage: {
    type: Number,
    default: 80, // Max 80% of estimated cost
  },
  requireReceiptThreshold: {
    type: Number,
    default: 500, // Receipts mandatory for expenses > ₹500
  },
  maxTripDurationDays: {
    type: Number,
    default: 30,
  },
  notes: {
    type: String,
    default: 'Standard corporate travel compliance rule.',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('TravelPolicy', travelPolicySchema);
