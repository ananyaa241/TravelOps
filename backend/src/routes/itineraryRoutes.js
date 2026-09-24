// backend/src/routes/itineraryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getItineraryByTripId,
  createOrUpdateItinerary,
  addItineraryItem,
  deleteItineraryItem,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:tripId', getItineraryByTripId);
router.post('/', createOrUpdateItinerary);
router.post('/:id/items', addItineraryItem);
router.delete('/:id/items/:itemId', deleteItineraryItem);

module.exports = router;
