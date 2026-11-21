const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);
router.get('/providers', adminController.getProviderConfigs);
router.put('/providers/:id', adminController.updateProviderConfig);
router.get('/demo-records', adminController.getDemoGasRecords);
router.post('/bookings/:reference/advance', adminController.advanceBookingStatus);
router.get('/tickets', adminController.getSupportTickets);
router.put('/tickets/:id', adminController.updateTicketStatus);

module.exports = router;
