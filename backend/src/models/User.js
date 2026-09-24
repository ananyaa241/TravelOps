// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    enum: [
      'COMPANY ADMIN',
      'EMPLOYEE',
      'MANAGER',
      'TRAVEL COORDINATOR',
      'FINANCE OFFICER',
    ],
    default: 'EMPLOYEE',
    index: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true,
  },
  departmentName: {
    type: String,
    default: 'Engineering',
  },
  designation: {
    type: String,
    default: 'Software Engineer',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  city: {
    type: String,
    default: 'Hyderabad',
  },
  avatar: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      approvals: { type: Boolean, default: true },
    },
    mealPreference: { type: String, default: 'Vegetarian' },
    seatPreference: { type: String, default: 'Window' },
  }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
