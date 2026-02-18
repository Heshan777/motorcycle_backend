const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../utils/asyncHandler');

const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, subject, message, motorcycle, phone } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Name, email, subject and message are required');
  }

  if (motorcycle && !mongoose.Types.ObjectId.isValid(motorcycle)) {
    res.status(400);
    throw new Error('Invalid motorcycle id');
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    subject,
    message,
    phone,
    motorcycle: motorcycle || null,
  });

  res.status(201).json({ success: true, inquiry });
});

const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find()
    .populate('motorcycle', 'name slug brand category')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: inquiries.length, inquiries });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['new', 'in-progress', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('motorcycle', 'name slug brand category');

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.status(200).json({ success: true, inquiry });
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  await inquiry.deleteOne();
  res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
});

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
