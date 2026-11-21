const express = require('express');
const router = express.Router();
const lpgController = require('../controllers/lpgController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public: Get LPG Providers (Indane, Bharat Gas, HP Gas)
router.get('/providers', lpgController.getProviders);

// Protected Citizen Routes
router.post('/verify-consumer', authenticateToken, lpgController.verifyConsumer);
router.post('/link-connection', authenticateToken, lpgController.linkConnection);
router.get('/my-connections', authenticateToken, lpgController.getUserConnections);
router.get('/connections/:id', authenticateToken, lpgController.getConnectionDetails);
router.delete('/connections/:id', authenticateToken, lpgController.unlinkConnection);

module.exports = router;
