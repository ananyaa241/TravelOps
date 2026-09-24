// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getTravelReport, getExpenseReport, getDepartmentSpendReport } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('COMPANY ADMIN', 'FINANCE OFFICER', 'MANAGER'));

router.get('/travel', getTravelReport);
router.get('/expenses', getExpenseReport);
router.get('/department-spend', getDepartmentSpendReport);

module.exports = router;
