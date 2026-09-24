// backend/src/controllers/auditController.js
const AuditLog = require('../models/AuditLog');

// @desc    Get system audit history with entity, user & date filters
// @route   GET /api/audit-logs
// @access  Private (Admin, Manager, Finance)
const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, entityId, action, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (action) query.action = action;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role employeeId avatar')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
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

module.exports = { getAuditLogs };
