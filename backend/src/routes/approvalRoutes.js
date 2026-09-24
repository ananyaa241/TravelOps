// backend/src/routes/approvalRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  requestChanges,
} = require('../controllers/approvalController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('MANAGER', 'FINANCE OFFICER', 'COMPANY ADMIN'));

router.get('/', getPendingApprovals);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);
router.post('/:id/request-changes', requestChanges);

module.exports = router;
