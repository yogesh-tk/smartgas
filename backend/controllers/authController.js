const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const brevoService = require('../services/brevoService');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat_gas_portal_super_secure_jwt_secret_key_2026';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Send email verification OTP using Brevo. Mobile number is profile data only;
 * it is never used for OTP or authentication.
 */
async function sendEmailOtp(req, res) {
  try {
    const { fullName, email } = req.body;
    if (!fullName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
      return res.status(400).json({ success: false, error: 'Enter your name and a valid email address.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.users.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ success: false, error: 'This email is already registered. Please sign in.' });

    const otp = generateOtp();
    await brevoService.sendVerificationOtp({ email: cleanEmail, name: fullName.trim(), otp });
    await db.otps.create({
      email: cleanEmail,
      otp_code: otp,
      purpose: 'email_registration',
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      is_used: false,
    });
    return res.json({ success: true, message: `Verification code sent to ${cleanEmail}. It expires in 10 minutes.` });
  } catch (err) {
    console.error('Email OTP error:', err.message);
    return res.status(502).json({ success: false, error: err.message || 'Could not send verification email.' });
  }
}

async function verifyEmailOtpAndRegister(req, res) {
  try {
    const { fullName, email, mobileNumber = '', password, otp, state = 'Tamil Nadu', district = 'Chennai', language = 'en' } = req.body;
    if (!fullName?.trim() || !email || !password || !otp) {
      return res.status(400).json({ success: false, error: 'Name, email, password and email OTP are required.' });
    }
    if (String(password).length < 8) return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters.' });
    const cleanEmail = email.trim().toLowerCase();
    const record = await db.otps.findLatest(cleanEmail, 'email_registration');
    if (!record || record.otp_code !== String(otp).trim() || record.is_used || new Date(record.expires_at) <= new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired email verification code.' });
    }
    const cleanMobile = String(mobileNumber).replace(/\D/g, '').slice(-10);
    if (cleanMobile && cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, error: 'Mobile number must contain 10 digits.' });
    }
    const existing = await db.users.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ success: false, error: 'This email is already registered. Please sign in.' });
    if (cleanMobile) {
      const mobileExisting = await db.users.findOne({ mobile_number: cleanMobile });
      if (mobileExisting) return res.status(409).json({ success: false, error: 'This mobile number is already linked to an account.' });
    }

    const user = await db.users.create({
      full_name: fullName.trim(),
      email: cleanEmail,
      mobile_number: cleanMobile || undefined,
      password_hash: await bcrypt.hash(password, 10),
      role: 'citizen',
      language,
      state,
      district,
      is_verified: true,
    });
    await db.otps.markUsed(record._id || record.id);
    const token = jwt.sign({ id: user._id || user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      success: true,
      message: 'Email verified and account created successfully.',
      token,
      user: {
        id: user._id || user.id, full_name: user.full_name, email: user.email,
        mobile_number: user.mobile_number, role: user.role, language, state, district,
      },
    });
  } catch (err) {
    console.error('Registration verification error:', err);
    return res.status(500).json({ success: false, error: 'Could not complete registration.' });
  }
}

/**
 * Standard Email/Password Login
 */
async function loginWithPassword(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Email/Mobile and Password.',
        errorTa: 'மின்னஞ்சல்/மொபைல் மற்றும் கடவுச்சொல் தேவை.',
      });
    }

    const clean = identifier.trim();
    const user = await db.users.findOne({
      $or: [{ mobile_number: clean }, { email: clean.toLowerCase() }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No account registered with this email or mobile number.',
        errorTa: 'இந்த விவரங்களுடன் கணக்கு ஏதும் இல்லை.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.',
        errorTa: 'தவறான கடவுச்சொல்.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id || user.id,
        email: user.email,
        mobile_number: user.mobile_number,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user._id || user.id,
      full_name: user.full_name,
      email: user.email,
      mobile_number: user.mobile_number,
      role: user.role,
      language: user.language || 'en',
      state: user.state,
      district: user.district,
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      messageTa: 'வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Login failed.',
      errorTa: 'உள்நுழைவு பிழை.',
    });
  }
}

/**
 * Get Current User Profile
 */
async function getProfile(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Update Profile Settings
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { language, district, state, fcmToken } = req.body;

    const update = {};
    if (language) update.language = language;
    if (district) update.district = district;
    if (state) update.state = state;
    if (fcmToken) update.fcm_token = fcmToken;

    await db.users.findByIdAndUpdate(userId, update);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      messageTa: 'சுயவிவரம் புதுப்பிக்கப்பட்டது.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  sendEmailOtp,
  verifyEmailOtpAndRegister,
  loginWithPassword,
  getProfile,
  updateProfile,
};
