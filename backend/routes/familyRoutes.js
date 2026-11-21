const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Citizen Family Management
router.get('/members', authenticateToken, familyController.getFamilyMembers);
router.post('/invite', authenticateToken, familyController.inviteMember);
router.delete('/members/:id', authenticateToken, familyController.revokeConsent);

// Consent Action by Token (Public / accessible by family member clicking email link)
router.get('/consent/:token', familyController.getConsentDetails);
router.post('/consent/:token/respond', familyController.respondToConsent);

module.exports = router;
