const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const { motorcycle, name, email, phone, city, preferredDate, notes } = req.body;

  if (!motorcycle || !name || !email || !phone || !city || !preferredDate) {
    res.status(400);
    throw new Error('All required fields must be provided');
  }

  if (!mongoose.Types.ObjectId.isValid(motorcycle)) {
    res.status(400);
    throw new Error('Invalid motorcycle id');
  }

  const booking = await Booking.create({
    user: req.user ? req.user._id : null,
    motorcycle,
    name,
    email,
    phone,
    city,
    preferredDate,
    notes,
  });

  const populated = await Booking.findById(booking._id)
    .populate('motorcycle', 'name slug brand category')
    .populate('user', 'name email');

  res.status(201).json({ success: true, booking: populated });
});

const getBookings = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

  const bookings = await Booking.find(filter)
    .populate('motorcycle', 'name slug brand category')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate('motorcycle', 'name slug brand category')
    .populate('user', 'name email');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json({ success: true, booking });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden: you can only delete your own booking');
  }

  await booking.deleteOne();
  res.status(200).json({ success: true, message: 'Booking deleted successfully' });
});

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
};
