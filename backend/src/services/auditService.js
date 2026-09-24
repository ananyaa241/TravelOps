// backend/src/services/auditService.js
const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  user,
  userName,
  userRole,
  action,
  entity,
  entityId,
  description,
  previousState = null,
  newState = null,
  ipAddress = '127.0.0.1',
}) => {
  try {
    const log = await AuditLog.create({
      user: user || null,
      userName: userName || (user && user.name) || 'System',
      userRole: userRole || (user && user.role) || 'SYSTEM',
      action,
      entity,
      entityId: String(entityId),
      description,
      previousState,
      newState,
      ipAddress,
      timestamp: new Date(),
    });
    return log;
  } catch (error) {
    console.error('[AuditLog] Failed to create audit log:', error.message);
  }
};

module.exports = { logAudit };
