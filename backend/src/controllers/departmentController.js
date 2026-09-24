// backend/src/controllers/departmentController.js
const Department = require('../models/Department');
const { logAudit } = require('../services/auditService');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'name email employeeId');
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, annualBudget, manager } = req.body;

    const exists = await Department.findOne({ $or: [{ name }, { code }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Department with this name or code already exists' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      annualBudget: annualBudget || 1000000,
      manager: manager || null,
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DEPARTMENT_CREATED',
      entity: 'DEPARTMENT',
      entityId: department._id,
      description: `Created department: ${department.name} (${department.code})`,
      newState: department,
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, annualBudget, manager, isActive } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const prevState = department.toObject();

    if (name) department.name = name;
    if (code) department.code = code;
    if (description !== undefined) department.description = description;
    if (annualBudget !== undefined) department.annualBudget = annualBudget;
    if (manager !== undefined) department.manager = manager;
    if (typeof isActive === 'boolean') department.isActive = isActive;

    await department.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DEPARTMENT_UPDATED',
      entity: 'DEPARTMENT',
      entityId: department._id,
      description: `Updated department: ${department.name}`,
      previousState: prevState,
      newState: department.toObject(),
    });

    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Department.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DEPARTMENT_DELETED',
      entity: 'DEPARTMENT',
      entityId: req.params.id,
      description: `Deleted department ${department.name}`,
    });

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
