// backend/src/routes/reimbursementRoutes.js
const express = require('express');
const router = express.Router();
const { getReimbursements, processReimbursement } = require('../controllers/reimbursementController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getReimbursements);
router.post('/:id/process', authorizeRoles('FINANCE OFFICER', 'COMPANY ADMIN'), processReimbursement);

module.exports = router;
