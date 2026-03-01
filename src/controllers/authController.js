



























const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const syncGoogleUser = async ({ sub: googleId, email, name }) => {
  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId });
  }

  return user;
};

const getGoogleRedirectUri = (req) =>
  process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

const startGoogleAuth = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500);
    throw new Error('Google OAuth is not configured: GOOGLE_CLIENT_ID is missing');
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  if (req.query.state) {
    params.set('state', String(req.query.state));
  }

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user: buildAuthResponse(user) });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);
  res.status(200).json({ success: true, token, user: buildAuthResponse(user) });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {
    name: req.body.name,
    phone: req.body.phone,
  };

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({ success: true, user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Role must be user or admin');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  // Verify the Google ID token server-side
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401);
    throw new Error('Invalid Google token');
  }

  const user = await syncGoogleUser(payload);

  const token = generateToken(user._id);
  res.status(200).json({ success: true, token, user: buildAuthResponse(user) });
});

const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    res.status(400);
    throw new Error('Google authorization code is required');
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(500);
    throw new Error(
      'Google OAuth is not configured: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required'
    );
  }

  try {
    const tokenBody = new URLSearchParams({
      code: String(code),
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: getGoogleRedirectUri(req),
      grant_type: 'authorization_code',
    });

    const { data } = await axios.post('https://oauth2.googleapis.com/token', tokenBody.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!data.id_token) {
      res.status(401);
      throw new Error('Google did not return an ID token');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: data.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const user = await syncGoogleUser(payload);
    const token = generateToken(user._id);

    if (process.env.GOOGLE_AUTH_SUCCESS_REDIRECT) {
      const redirectUrl = new URL(process.env.GOOGLE_AUTH_SUCCESS_REDIRECT);
      redirectUrl.searchParams.set('token', token);
      if (state) {
        redirectUrl.searchParams.set('state', String(state));
      }

      return res.redirect(redirectUrl.toString());
    }

    res.status(200).json({ success: true, token, user: buildAuthResponse(user) });
  } catch (error) {
    if (process.env.GOOGLE_AUTH_ERROR_REDIRECT) {
      const errorRedirect = new URL(process.env.GOOGLE_AUTH_ERROR_REDIRECT);
      errorRedirect.searchParams.set('error', 'google_auth_failed');
      if (state) {
        errorRedirect.searchParams.set('state', String(state));
      }

      return res.redirect(errorRedirect.toString());
    }

    res.status(401);
    throw new Error('Google OAuth failed');
  }
});

module.exports = {
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
};
