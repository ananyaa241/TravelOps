// backend/src/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, reviewExpense } = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getExpenses);
router.post('/', createExpense);
router.post('/:id/review', authorizeRoles('FINANCE OFFICER', 'COMPANY ADMIN'), reviewExpense);

module.exports = router;
