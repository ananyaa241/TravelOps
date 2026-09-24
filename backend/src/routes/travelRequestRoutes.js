// backend/src/routes/travelRequestRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTravelRequests,
  getTravelRequestById,
  createTravelRequest,
  updateTravelRequest,
  cancelTravelRequest,
  checkPolicyPreview,
} = require('../controllers/travelRequestController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTravelRequests);
router.post('/check-policy', checkPolicyPreview);
router.get('/:id', getTravelRequestById);
router.post('/', createTravelRequest);
router.put('/:id', updateTravelRequest);
router.post('/:id/cancel', cancelTravelRequest);

module.exports = router;
