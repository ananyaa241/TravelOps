// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const {
  getEmployeeDashboard,
  getManagerDashboard,
  getCoordinatorDashboard,
  getFinanceDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/employee', getEmployeeDashboard);
router.get('/manager', authorizeRoles('MANAGER', 'COMPANY ADMIN'), getManagerDashboard);
router.get('/coordinator', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), getCoordinatorDashboard);
router.get('/finance', authorizeRoles('FINANCE OFFICER', 'COMPANY ADMIN'), getFinanceDashboard);
router.get('/admin', authorizeRoles('COMPANY ADMIN'), getAdminDashboard);

module.exports = router;
