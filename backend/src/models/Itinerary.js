// backend/src/models/Itinerary.js
const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Flight', 'Hotel', 'Train', 'Taxi', 'Car Rental', 'Meeting', 'Meal', 'Other'],
    required: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  bookingReference: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    default: '09:00',
  },
  endTime: {
    type: String,
    default: '10:00',
  },
  origin: {
    type: String,
    default: '',
  },
  destination: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    default: 'Confirmed',
  },
  notes: {
    type: String,
    default: '',
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
  }]
});

const itinerarySchema = new mongoose.Schema({
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
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [itineraryItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
