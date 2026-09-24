// backend/src/routes/policyRoutes.js
const express = require('express');
const router = express.Router();
const { getPolicies, getPolicyById, createPolicy, updatePolicy, deletePolicy } = require('../controllers/policyController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getPolicies);
router.get('/:id', getPolicyById);
router.post('/', authorizeRoles('COMPANY ADMIN'), createPolicy);
router.put('/:id', authorizeRoles('COMPANY ADMIN'), updatePolicy);
router.delete('/:id', authorizeRoles('COMPANY ADMIN'), deletePolicy);

module.exports = router;
