const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const motorcycleRoutes = require('./routes/motorcycleRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/motorcycles', motorcycleRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
