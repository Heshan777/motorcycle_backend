const express = require('express');
const {
  registerUser,
  loginUser,
  startGoogleAuth,
  googleLogin,
  googleOAuthCallback,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', startGoogleAuth);
router.post('/google', googleLogin);
router.get('/google/callback', googleOAuthCallback);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
