// backend/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const TravelRequest = require('../models/TravelRequest');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const generateBookingId = async () => {
  const count = await Booking.countDocuments();
  return `BK-${2000 + count + 1}`;
};

// @desc    Get all bookings with filters
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { status, bookingType, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('travelRequest')
      .populate('vendor')
      .populate('coordinator', 'name email')
      .sort({ travelDate: 1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking for a travel request
// @route   POST /api/bookings
// @access  Private (Coordinator, Admin)
const createBooking = async (req, res, next) => {
  try {
    const { travelRequestId, vendor, vendorName, bookingType, referenceNumber, travelDate, returnDate, cost, notes } = req.body;
    const travelRequest = await TravelRequest.findById(travelRequestId);

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      travelRequest: travelRequestId,
      requestId: travelRequest.requestId,
      employeeName: travelRequest.employeeName,
      destination: travelRequest.destination,
      vendor: vendor || null,
      vendorName: vendorName || 'Direct Booking',
      bookingType,
      referenceNumber,
      travelDate: travelDate || travelRequest.departureDate,
      returnDate: returnDate || travelRequest.returnDate,
      cost: cost || 0,
      coordinator: req.user._id,
      notes,
      status: 'Confirmed',
    });

    // Update travel request booking status
    travelRequest.status = 'Booked';
    travelRequest.bookingStatus = 'Completed';
    await travelRequest.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOKING_CREATED',
      entity: 'BOOKING',
      entityId: booking.bookingId,
      description: `Created ${bookingType} booking (${referenceNumber}) for trip ${travelRequest.requestId}`,
      newState: booking,
    });

    // Notify employee
    await createNotification({
      recipientId: travelRequest.employee,
      title: `Booking Confirmed for ${travelRequest.destination} ✈️`,
      message: `Your ${bookingType} booking (Ref: ${referenceNumber}) has been confirmed by ${req.user.name}.`,
      type: 'BOOKING_UPDATE',
      link: `/trips`,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private (Coordinator, Admin)
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOKING_UPDATED',
      entity: 'BOOKING',
      entityId: booking.bookingId,
      description: `Updated booking ${booking.bookingId}`,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Coordinator, Admin)
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };
