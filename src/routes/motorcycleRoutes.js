const express = require('express');
const {
  createMotorcycle,
  getMotorcycles,
  getMotorcycleByIdentifier,
  updateMotorcycle,
  deleteMotorcycle,
} = require('../controllers/motorcycleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMotorcycles);
router.get('/:identifier', getMotorcycleByIdentifier);

router.post('/', protect, authorize('admin'), createMotorcycle);
router.put('/:id', protect, authorize('admin'), updateMotorcycle);
router.delete('/:id', protect, authorize('admin'), deleteMotorcycle);

module.exports = router;
