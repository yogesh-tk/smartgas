const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/book', authenticateToken, bookingController.createBooking);
router.get('/track/:reference', bookingController.trackBooking); // Public/trackable with reference
router.post('/cancel/:reference', authenticateToken, bookingController.cancelBooking);
router.get('/my-bookings', authenticateToken, bookingController.getUserBookings);
router.get('/receipt/:reference', bookingController.downloadReceipt);

module.exports = router;
