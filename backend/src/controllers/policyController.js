// backend/src/controllers/policyController.js
const TravelPolicy = require('../models/TravelPolicy');
const { logAudit } = require('../services/auditService');

// @desc    Get all travel policies
// @route   GET /api/policies
// @access  Private
const getPolicies = async (req, res, next) => {
  try {
    const policies = await TravelPolicy.find().populate('department', 'name code');
    res.json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get policy by ID
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = async (req, res, next) => {
  try {
    const policy = await TravelPolicy.findById(req.params.id).populate('department');
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// @desc    Create travel policy
// @route   POST /api/policies
// @access  Private (Admin)
const createPolicy = async (req, res, next) => {
  try {
    const policy = await TravelPolicy.create(req.body);

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'POLICY_CREATED',
      entity: 'POLICY',
      entityId: policy._id,
      description: `Created travel policy: ${policy.title}`,
      newState: policy,
    });

    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// @desc    Update travel policy
// @route   PUT /api/policies/:id
// @access  Private (Admin)
const updatePolicy = async (req, res, next) => {
  try {
    const policy = await TravelPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'POLICY_UPDATED',
      entity: 'POLICY',
      entityId: policy._id,
      description: `Updated travel policy: ${policy.title}`,
      newState: policy,
    });

    res.json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete travel policy
// @route   DELETE /api/policies/:id
// @access  Private (Admin)
const deletePolicy = async (req, res, next) => {
  try {
    const policy = await TravelPolicy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'POLICY_DELETED',
      entity: 'POLICY',
      entityId: req.params.id,
      description: `Deleted travel policy: ${policy.title}`,
    });

    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPolicies, getPolicyById, createPolicy, updatePolicy, deletePolicy };
