const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBookingStatus, getBooking } = require('../controllers/bookingController');
const { protect, requireAdmin, requirePatient } = require('../middleware/auth');

// GET /api/bookings — Get user's bookings
router.get('/', protect, getBookings);

// GET /api/bookings/:id — Get single booking
router.get('/:id', protect, getBooking);

// POST /api/bookings — Create booking (patient)
router.post('/', protect, requirePatient, createBooking);

// PUT /api/bookings/:id/status — Update booking status (admin)
router.put('/:id/status', protect, requireAdmin, updateBookingStatus);

module.exports = router;
