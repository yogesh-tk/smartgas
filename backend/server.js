require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

// Route imports
const authRoutes = require('./routes/authRoutes');
const lpgRoutes = require('./routes/lpgRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const familyRoutes = require('./routes/familyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check & System info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'Bharat Scheme - Smart Gas Management System (MERN Stack)',
    projectTa: 'பாரத் திட்டம் - சீர்மிகு எரிவாயு மேலாண்மை பிரிவு (MongoDB + Express + React + Node.js)',
    version: '2.0.0-PROD',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
    databaseEngine: db.isMongoLive() ? 'MONGODB_LIVE' : 'MONGODB_SANDBOX_STANDALONE',
    lpgProvidersSupported: ['Indane Gas (IOCL)', 'Bharat Gas (BPCL)', 'HP Gas (HPCL)'],
    emergencyHelpline: '1906 (24x7 Emergency LPG Leak Helpline)',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/lpg', lpgRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start Server
async function startServer() {
  await db.initDatabase();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Bharat Scheme LPG Backend listening on http://localhost:${PORT}`);
    console.log(`🍃 Database: MongoDB (Mongoose Schema & Collections)`);
    console.log(`🇮🇳 Government LPG Portal: Indane | Bharat Gas | HP Gas`);
    console.log(`======================================================\n`);
  });
}

startServer();
