// backend/src/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const { getVendors, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getVendors);
router.post('/', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), createVendor);
router.put('/:id', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), updateVendor);
router.delete('/:id', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), deleteVendor);

module.exports = router;
