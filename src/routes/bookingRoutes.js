const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createBooking);

router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
