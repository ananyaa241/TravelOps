// backend/src/routes/auditRoutes.js
const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('COMPANY ADMIN', 'FINANCE OFFICER', 'MANAGER'));

router.get('/', getAuditLogs);

module.exports = router;
