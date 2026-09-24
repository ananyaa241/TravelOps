// backend/src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getDepartments);
router.post('/', authorizeRoles('COMPANY ADMIN'), createDepartment);
router.put('/:id', authorizeRoles('COMPANY ADMIN'), updateDepartment);
router.delete('/:id', authorizeRoles('COMPANY ADMIN'), deleteDepartment);

module.exports = router;
