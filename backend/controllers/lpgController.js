const db = require('../config/db');
const lpgAdapter = require('../services/lpg');
const brevoService = require('../services/brevoService');

/**
 * Fetch available LPG Providers
 */
async function getProviders(req, res) {
  try {
    const providers = await db.providers.find({ is_active: true });
    return res.json({
      success: true,
      providers,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Step 1: Verify LPG Consumer via LPG Grid & Send Email OTP
 */
async function verifyConsumer(req, res) {
  try {
    const { providerId, consumerNumber, registeredMobile, language = 'en' } = req.body;

    if (!providerId || !consumerNumber || !registeredMobile) {
      return res.status(400).json({
        success: false,
        error: 'LPG Provider, Consumer Number, and Registered Mobile are required.',
        errorTa: 'எரிவாயு நிறுவனம், நுகர்வோர் எண், மற்றும் பதிவுசெய்த மொபைல் எண் தேவை.',
      });
    }

    const cleanMobile = registeredMobile.replace(/[^\d]/g, '').slice(-10);

    // Call modular LPG Provider Adapter
    const verification = await lpgAdapter.verifyConsumer({
      providerId,
      consumerNumber,
      mobileNumber: cleanMobile,
    });

    if (!verification.success) {
      return res.status(404).json({
        success: false,
        error: verification.error || 'Consumer number not found in LPG Grid database.',
        errorTa: 'நுகர்வோர் எண் காணப்படவில்லை.',
        is_simulated: verification.is_simulated,
      });
    }

    // Generate ownership verification OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Ownership OTP is sent only to the signed-in user's verified email.
    if (!req.user.email) return res.status(400).json({ success: false, error: 'Your account must have an email address for verification.' });
    await brevoService.sendVerificationOtp({ email: req.user.email, name: req.user.full_name || 'Bharat Scheme user', otp });
    await db.otps.create({
      email: req.user.email.toLowerCase(),
      otp_code: otp,
      purpose: 'connection_link',
      expires_at: expiresAt,
      is_used: false,
    });

    return res.json({
      success: true,
      verified: true,
      message: `Ownership verification code sent to ${req.user.email}.`,
      messageTa: `சரிபார்ப்பு OTP உங்கள் மொபைல் எண்ணிற்கு அனுப்பப்பட்டது.`,
      is_simulated: verification.is_simulated,
      dataSource: verification.dataSource,
      consumer: verification.consumer,
    });
  } catch (err) {
    console.error('Error in verifyConsumer:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Step 2: Confirm OTP & Link LPG Connection
 */
async function linkConnection(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const {
      providerId,
      consumerNumber,
      registeredMobile,
      otp,
      relationshipType = 'self',
      consumerName,
      distributorName,
      deliveryAddress,
      cylinderType = '14.2kg',
    } = req.body;

    if (!providerId || !consumerNumber || !registeredMobile || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required linking parameters.',
        errorTa: 'தேவையான விவரங்கள் விடுபட்டுள்ளன.',
      });
    }

    const cleanMobile = registeredMobile.replace(/[^\d]/g, '').slice(-10);

    // Verify OTP
    const latestOtp = await db.otps.findLatest(String(req.user.email || '').toLowerCase(), 'connection_link');
    const isValid = Boolean(latestOtp && latestOtp.otp_code === String(otp).trim() && !latestOtp.is_used && new Date(latestOtp.expires_at) > new Date());
    if (isValid) await db.otps.markUsed(latestOtp._id || latestOtp.id);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP code.',
        errorTa: 'தவறான அல்லது காலாவதியான OTP எண்.',
      });
    }

    // Check if already linked
    const existing = await db.connections.findOne({
      user_id: userId,
      provider_id: providerId,
      consumer_number: consumerNumber.trim().toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'This LPG connection is already linked to your Bharat Scheme dashboard.',
        errorTa: 'இந்த இணைப்பு ஏற்கனவே இணைக்கப்பட்டுள்ளது.',
      });
    }

    // Fetch full connection details from LPG Adapter
    const connDetails = await lpgAdapter.fetchConnectionDetails({
      providerId,
      consumerNumber: consumerNumber.trim().toUpperCase(),
    });

    const conn = connDetails.connection;

    // Create Connection in MongoDB
    const newConnection = await db.connections.create({
      user_id: userId,
      provider_id: providerId,
      consumer_number: conn.consumerNumber,
      lpg_id_17digit: conn.lpgId17Digit,
      registered_mobile: cleanMobile,
      consumer_name: consumerName || conn.consumerName,
      relationship_type: relationshipType,
      connection_status: 'active',
      cylinder_type: cylinderType || conn.cylinderType,
      distributor_code: conn.distributorCode || 'DIST-01',
      distributor_name: distributorName || conn.distributorName,
      delivery_address: deliveryAddress || conn.deliveryAddress,
      district: conn.district || 'Chennai',
      pincode: conn.pincode || '600001',
      consent_status: relationshipType === 'self' ? 'not_required' : 'granted',
    });

    // Create welcoming notification
    await db.notifications.create({
      user_id: userId,
      title: `${conn.providerName} Connection Linked!`,
      title_ta: `${conn.providerName} இணைப்பு வெற்றிகரமாக இணைக்கப்பட்டது!`,
      message: `Consumer Number ${conn.maskedConsumerNumber} has been successfully verified and linked to your Smart Gas dashboard.`,
      message_ta: `நுகர்வோர் எண் ${conn.maskedConsumerNumber} உங்கள் டாஷ்போர்டில் இணைக்கப்பட்டுள்ளது.`,
      notification_type: 'general',
      channel: 'all',
      reference_id: String(newConnection._id || newConnection.id),
    });

    return res.status(201).json({
      success: true,
      message: 'LPG connection linked successfully to Bharat Scheme dashboard.',
      messageTa: 'எரிவாயு இணைப்பு வெற்றிகரமாக இணைக்கப்பட்டது.',
      connectionId: newConnection._id || newConnection.id,
      consumer: conn,
    });
  } catch (err) {
    console.error('Error linking connection:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch All Connections for the Logged-In User
 */
async function getUserConnections(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const connections = await db.connections.find({ user_id: userId });

    const enriched = connections.map((conn) => {
      const masked = conn.consumer_number.length > 4
        ? conn.consumer_number.slice(0, 3) + '-***-' + conn.consumer_number.slice(-4)
        : '***' + conn.consumer_number;

      return {
        ...conn,
        id: conn._id || conn.id,
        masked_consumer_number: masked,
        aadhaar_number: undefined,
      };
    });

    return res.json({
      success: true,
      connections: enriched,
    });
  } catch (err) {
    console.error('Error fetching connections:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch Detailed Connection Data with Refill History and Subsidy Info
 */
async function getConnectionDetails(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const connectionId = req.params.id;

    const conn = await db.connections.findById(connectionId);
    if (!conn || String(conn.user_id) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found or permission denied.',
        errorTa: 'இணைப்பு விவரங்கள் காணப்படவில்லை.',
      });
    }

    const bookings = await db.bookings.find({ connection_id: connectionId });

    // Fetch subsidy details from LPG Adapter
    const subsidyData = await lpgAdapter.fetchSubsidyDetails({
      providerId: conn.provider_id,
      consumerNumber: conn.consumer_number,
    });

    return res.json({
      success: true,
      connection: {
        ...conn,
        id: conn._id || conn.id,
        masked_consumer_number: conn.consumer_number.slice(0, 3) + '-***-' + conn.consumer_number.slice(-4),
      },
      bookings,
      subsidy: subsidyData.subsidy,
      is_simulated: true,
      dataSource: lpgAdapter.dataSourceNotice,
    });
  } catch (err) {
    console.error('Error in getConnectionDetails:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Unlink connection
 */
async function unlinkConnection(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const connectionId = req.params.id;

    await db.connections.deleteOne({ _id: connectionId, user_id: userId });

    return res.json({
      success: true,
      message: 'Connection unlinked from your dashboard.',
      messageTa: 'இணைப்பு நீக்கப்பட்டது.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getProviders,
  verifyConsumer,
  linkConnection,
  getUserConnections,
  getConnectionDetails,
  unlinkConnection,
};
