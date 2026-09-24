// backend/src/controllers/vendorController.js
const Vendor = require('../models/Vendor');
const { logAudit } = require('../services/auditService');

// @desc    Get all vendors with search and type filter
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res, next) => {
  try {
    const { vendorType, search } = req.query;
    const query = {};

    if (vendorType) query.vendorType = vendorType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ name: 1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private (Coordinator, Admin)
const createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VENDOR_CREATED',
      entity: 'VENDOR',
      entityId: vendor._id,
      description: `Added vendor: ${vendor.name} (${vendor.vendorType})`,
      newState: vendor,
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Coordinator, Admin)
const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VENDOR_UPDATED',
      entity: 'VENDOR',
      entityId: vendor._id,
      description: `Updated vendor: ${vendor.name}`,
    });

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Coordinator, Admin)
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendors, createVendor, updateVendor, deleteVendor };
