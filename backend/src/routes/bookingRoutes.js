// backend/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getBookings);
router.post('/', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), createBooking);
router.put('/:id', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), updateBooking);
router.delete('/:id', authorizeRoles('TRAVEL COORDINATOR', 'COMPANY ADMIN'), deleteBooking);

module.exports = router;
