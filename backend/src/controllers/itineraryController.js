// backend/src/controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const TravelRequest = require('../models/TravelRequest');
const { logAudit } = require('../services/auditService');

// @desc    Get itinerary for a travel request
// @route   GET /api/itineraries/:tripId
// @access  Private
const getItineraryByTripId = async (req, res, next) => {
  try {
    let itinerary = await Itinerary.findOne({ travelRequest: req.params.tripId });

    if (!itinerary) {
      // Return empty default structure if none exists yet
      return res.json({
        success: true,
        data: {
          travelRequest: req.params.tripId,
          items: [],
        }
      });
    }

    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update full itinerary
// @route   POST /api/itineraries
// @access  Private (Coordinator, Admin, Employee)
const createOrUpdateItinerary = async (req, res, next) => {
  try {
    const { travelRequestId, items } = req.body;
    const travelRequest = await TravelRequest.findById(travelRequestId);

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    let itinerary = await Itinerary.findOne({ travelRequest: travelRequestId });

    if (itinerary) {
      itinerary.items = items;
      await itinerary.save();
    } else {
      itinerary = await Itinerary.create({
        travelRequest: travelRequestId,
        requestId: travelRequest.requestId,
        employee: travelRequest.employee,
        items,
      });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ITINERARY_UPDATED',
      entity: 'ITINERARY',
      entityId: travelRequest.requestId,
      description: `Updated itinerary schedule (${items.length} items) for ${travelRequest.requestId}`,
    });

    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Add single item to itinerary
// @route   POST /api/itineraries/:id/items
// @access  Private
const addItineraryItem = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    itinerary.items.push(req.body);
    await itinerary.save();

    res.status(201).json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item from itinerary
// @route   DELETE /api/itineraries/:id/items/:itemId
// @access  Private
const deleteItineraryItem = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    itinerary.items = itinerary.items.filter(item => String(item._id) !== String(req.params.itemId));
    await itinerary.save();

    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItineraryByTripId, createOrUpdateItinerary, addItineraryItem, deleteItineraryItem };
