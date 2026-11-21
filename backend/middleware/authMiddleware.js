const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat_gas_portal_super_secure_jwt_secret_key_2026';

/**
 * Protect routes - Authenticate via JWT Token
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Authentication token is missing.',
      errorTa: 'அனுமதி மறுக்கப்பட்டது. அங்கீகார டோக்கன் தேவை.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: User account no longer exists.',
        errorTa: 'தவறான டோக்கன்: பயனர் கணக்கு இல்லை.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
      errorTa: 'காலாவதியான அமர்வு. மீண்டும் உள்நுழையவும்.',
    });
  }
}

/**
 * Restrict routes to Admin users
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access restricted to Bharat Gas Portal Administrators.',
      errorTa: 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி உண்டு.',
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
