const express = require('express');
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createInquiry);

router.get('/', protect, authorize('admin'), getInquiries);
router.put('/:id/status', protect, authorize('admin'), updateInquiryStatus);
router.delete('/:id', protect, authorize('admin'), deleteInquiry);

module.exports = router;
