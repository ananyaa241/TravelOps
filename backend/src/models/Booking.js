// backend/src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
  employeeName: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  vendorName: {
    type: String,
    default: 'Corporate Travel Desk',
  },
  bookingType: {
    type: String,
    enum: ['Flight', 'Hotel', 'Train', 'Car Rental', 'Package', 'Other'],
    required: true,
  },
  referenceNumber: {
    type: String,
    required: true,
    trim: true,
  },
  travelDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Modified', 'Cancelled', 'Completed'],
    default: 'Confirmed',
    index: true,
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmationDocs: [{
    fileName: String,
    fileUrl: String,
  }],
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
