const Motorcycle = require('../models/Motorcycle');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [motorcycles, bookings, inquiries, users, pendingBookings, newInquiries] = await Promise.all([
    Motorcycle.countDocuments(),
    Booking.countDocuments(),
    Inquiry.countDocuments(),
    User.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Inquiry.countDocuments({ status: 'new' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      motorcycles,
      bookings,
      inquiries,
      users,
      pendingBookings,
      newInquiries,
    },
  });
});

module.exports = { getDashboardStats };
