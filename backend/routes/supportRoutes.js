const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/tickets', authenticateToken, supportController.createTicket);
router.get('/my-tickets', authenticateToken, supportController.getMyTickets);

module.exports = router;
