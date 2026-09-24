// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');
const { logAudit } = require('../services/auditService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'travelops_super_secure_jwt_secret_key_2026_production', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public / Admin
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentName, employeeId, designation, phone, city } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    let dept = null;
    if (departmentName) {
      dept = await Department.findOne({ name: departmentName });
    }

    const count = await User.countDocuments();
    const finalEmployeeId = employeeId || `EMP-${1000 + count + 1}`;

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'EMPLOYEE',
      department: dept ? dept._id : null,
      departmentName: departmentName || 'Engineering',
      employeeId: finalEmployeeId,
      designation: designation || 'Associate',
      phone: phone || '+91 98765 43210',
      city: city || 'Hyderabad',
    });

    await logAudit({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: user._id,
      description: `New user account created for ${user.name} (${user.email}) as ${user.role}`,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        departmentName: user.departmentName,
        designation: user.designation,
        phone: user.phone,
        city: user.city,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact HR.' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        departmentName: user.departmentName,
        designation: user.designation,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        preferences: user.preferences,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, preferences, designation } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (designation) user.designation = designation;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
