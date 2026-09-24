// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const travelRequestRoutes = require('./routes/travelRequestRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const policyRoutes = require('./routes/policyRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration - Permissive for cross-domain SaaS deployments
const corsOptions = {
  origin: true, // Dynamically allow any incoming origin (Vercel, localhost, Render)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', apiLimiter);

// Health check endpoint for Render/uptime monitors
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'TravelOps API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes mounted on /api/* (standard)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/travel-requests', travelRequestRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reimbursements', reimbursementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);

// Fallback Aliases mounted on root /* (for clients missing /api prefix)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/departments', departmentRoutes);
app.use('/travel-requests', travelRequestRoutes);
app.use('/approvals', approvalRoutes);
app.use('/policies', policyRoutes);
app.use('/itineraries', itineraryRoutes);
app.use('/bookings', bookingRoutes);
app.use('/vendors', vendorRoutes);
app.use('/expenses', expenseRoutes);
app.use('/reimbursements', reimbursementRoutes);
app.use('/reports', reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/audit-logs', auditRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.send('✈️ TravelOps Corporate Travel Approval & Expense Management API is live.');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Central Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] TravelOps API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

module.exports = app;
