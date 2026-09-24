// backend/src/models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  vendorType: {
    type: String,
    required: true,
    enum: ['Airline', 'Hotel', 'Travel Agency', 'Transport', 'Car Rental', 'Other'],
  },
  contactPerson: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: 'Hyderabad',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
