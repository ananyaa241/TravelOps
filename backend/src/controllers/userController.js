// backend/src/controllers/userController.js
const User = require('../models/User');
const Department = require('../models/Department');
const { logAudit } = require('../services/auditService');

// @desc    Get all users with search, department & role filters
// @route   GET /api/users
// @access  Private (Admin, Manager, Coordinator, Finance)
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, employeeId, designation, phone, city } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User email already exists' });
    }

    let deptDoc = null;
    let deptName = 'General';
    if (department) {
      deptDoc = await Department.findById(department);
      if (deptDoc) deptName = deptDoc.name;
    }

    const count = await User.countDocuments();
    const finalEmpId = employeeId || `EMP-${1000 + count + 1}`;

    const newUser = await User.create({
      name,
      email,
      password: password || 'TravelOps@2026',
      role: role || 'EMPLOYEE',
      department: deptDoc ? deptDoc._id : null,
      departmentName: deptName,
      employeeId: finalEmpId,
      designation: designation || 'Specialist',
      phone: phone || '+91 98765 43210',
      city: city || 'Hyderabad',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_CREATED',
      entity: 'USER',
      entityId: newUser._id,
      description: `Created user ${newUser.name} with role ${newUser.role}`,
      newState: newUser,
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, designation, phone, city, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const prevState = user.toObject();

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (designation) user.designation = designation;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    if (department) {
      const deptDoc = await Department.findById(department);
      if (deptDoc) {
        user.department = deptDoc._id;
        user.departmentName = deptDoc.name;
      }
    }

    await user.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_UPDATED',
      entity: 'USER',
      entityId: user._id,
      description: `Updated profile & permissions for ${user.name}`,
      previousState: prevState,
      newState: user.toObject(),
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_DELETED',
      entity: 'USER',
      entityId: req.params.id,
      description: `Deleted user ${user.name} (${user.email})`,
      previousState: user.toObject(),
    });

    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
