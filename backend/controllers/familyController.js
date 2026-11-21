const crypto = require('crypto');
const db = require('../config/db');
const brevoService = require('../services/brevoService');
const lpgAdapter = require('../services/lpg');

/**
 * Get all family members linked to citizen's account
 */
async function getFamilyMembers(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const members = await db.family.find({ user_id: userId });

    const safeMembers = members.map((m) => {
      const hasConsent = m.consent_status === 'granted';
      const cNo = m.consumer_number || 'BHT-5541908';
      const masked = cNo.length > 4 ? cNo.slice(0, 3) + '-***-' + cNo.slice(-4) : '***' + cNo;

      return {
        id: m._id || m.id,
        memberName: m.member_name,
        relationship: m.relationship,
        mobileNumber: m.mobile_number.length > 4 ? m.mobile_number.slice(0, 2) + '****' + m.mobile_number.slice(-4) : m.mobile_number,
        rawMobile: hasConsent ? m.mobile_number : undefined,
        providerId: m.provider_id,
        providerName: m.provider_name,
        providerNameTa: m.provider_name_ta,
        logoBadge: m.logo_badge,
        primaryColor: m.primary_color,
        consumerNumber: hasConsent ? m.consumer_number : 'PROTECTED-CONSENT-REQUIRED',
        maskedConsumerNumber: hasConsent ? masked : '***-AWAITING-CONSENT',
        consentStatus: m.consent_status,
        consentDate: m.consent_date,
        consentToken: m.consent_token,
        permissions: m.permissions,
        canBookRefill: hasConsent,
        privacyNotice: hasConsent
          ? 'Consent Granted by Member. Connection details unlocked.'
          : 'Privacy Protection Active: Family member consent pending.',
      };
    });

    return res.json({
      success: true,
      members: safeMembers,
    });
  } catch (err) {
    console.error('Error fetching family members:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Invite a Family Member & Send Consent Link via Email
 */
async function inviteMember(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const inviterName = req.user.full_name;
    const { memberName, relationship, mobileNumber, providerId, consumerNumber, email, language = 'en' } = req.body;

    if (!memberName || !relationship || !mobileNumber || !email || !providerId || !consumerNumber) {
      return res.status(400).json({
        success: false,
        error: 'Member name, email, mobile, provider, and consumer number are required.',
        errorTa: 'அனைத்து குடும்ப உறுப்பினர் விவரங்களையும் நிரப்பவும்.',
      });
    }

    const cleanMobile = mobileNumber.replace(/[^\d]/g, '').slice(-10);
    const cleanConsumer = consumerNumber.trim().toUpperCase();

    const consentToken = `CONSENT-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

    // Verify consumer exists in LPG grid
    const verifyRes = await lpgAdapter.verifyConsumer({
      providerId,
      consumerNumber: cleanConsumer,
    });

    if (!verifyRes.success) {
      return res.status(400).json({
        success: false,
        error: 'Family member consumer number not recognized in LPG database.',
        errorTa: 'குடும்ப உறுப்பினரின் நுகர்வோர் எண் பொருந்தவில்லை.',
      });
    }

    // Save invitation in MongoDB
    if (!email) return res.status(400).json({ success: false, error: 'Family member email is required.' });

    const newMember = await db.family.create({
      user_id: userId,
      member_name: memberName,
      relationship,
      mobile_number: cleanMobile,
      email: email || null,
      provider_id: providerId,
      consumer_number: cleanConsumer,
      consent_status: 'pending',
      consent_token: consentToken,
      permissions: { view_details: true, view_history: true, allow_booking: true },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const consentUrl = `${clientUrl}/consent/${consentToken}`;

    await brevoService.sendEmail({
      to: email,
      subject: 'Bharat Scheme family connection consent request',
      textContent: `${inviterName} invited you to review a family LPG connection request. Open: ${consentUrl}`,
      htmlContent: `<p>${String(inviterName).replace(/[<>&"]/g, '')} invited you to review a family LPG connection request.</p><p><a href="${consentUrl}">Review consent request</a></p>`,
    });

    return res.status(201).json({
      success: true,
      message: `Consent request email sent to ${email}.`,
      messageTa: `குடும்ப உறுப்பினர் அனுமதி கோரிக்கை மின்னஞ்சலில் அனுப்பப்பட்டது.`,
      memberId: newMember._id || newMember.id,
      consentToken,
      consentUrl,
    });
  } catch (err) {
    console.error('Error inviting family member:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Public Endpoint: Review Consent Request by Token
 */
async function getConsentDetails(req, res) {
  try {
    const { token } = req.params;
    const m = await db.family.findOne({ consent_token: token });

    if (!m) {
      return res.status(404).json({
        success: false,
        error: 'Consent request token not found or expired.',
        errorTa: 'அனுமதி கோரிக்கை டோக்கன் காலாவதியாகிவிட்டது.',
      });
    }

    const cNo = m.consumer_number || 'HP-9902184';
    const masked = cNo.length > 4 ? cNo.slice(0, 3) + '-***-' + cNo.slice(-4) : '***' + cNo;
    const invMobile = m.inviter_mobile || '9876543210';

    return res.json({
      success: true,
      request: {
        token: m.consent_token,
        inviterName: m.inviter_name || 'Family Head',
        inviterMobile: invMobile.length > 4 ? invMobile.slice(0, 2) + '****' + invMobile.slice(-4) : invMobile,
        memberName: m.member_name,
        relationship: m.relationship,
        providerName: m.provider_name,
        maskedConsumerNumber: masked,
        consentStatus: m.consent_status,
        permissions: m.permissions,
        createdDate: m.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Member Grants or Rejects Consent
 */
async function respondToConsent(req, res) {
  try {
    const { token } = req.params;
    const { decision } = req.body;

    if (!['granted', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be granted or rejected.' });
    }

    const m = await db.family.findOne({ consent_token: token });
    if (!m) {
      return res.status(404).json({ success: false, error: 'Consent request not found.' });
    }

    // Update status in MongoDB
    await db.family.findOneAndUpdate(
      { consent_token: token },
      { consent_status: decision, consent_date: decision === 'granted' ? new Date() : null }
    );

    // If granted, add as linked connection
    if (decision === 'granted') {
      const connDetails = await lpgAdapter.fetchConnectionDetails({
        providerId: m.provider_id,
        consumerNumber: m.consumer_number,
      });

      const conn = connDetails.connection;

      const existing = await db.connections.findOne({
        user_id: m.user_id,
        consumer_number: m.consumer_number,
      });

      if (!existing) {
        await db.connections.create({
          user_id: m.user_id,
          provider_id: m.provider_id,
          consumer_number: m.consumer_number,
          lpg_id_17digit: conn.lpgId17Digit,
          registered_mobile: m.mobile_number,
          consumer_name: `${m.member_name} (${m.relationship})`,
          relationship_type: m.relationship,
          connection_status: 'active',
          cylinder_type: '14.2kg',
          distributor_code: conn.distributorCode || 'DIST-01',
          distributor_name: conn.distributorName,
          delivery_address: conn.deliveryAddress,
          district: conn.district || 'Chennai',
          pincode: conn.pincode || '600001',
          consent_status: 'granted',
          consent_granted_at: new Date(),
        });
      }

      await db.notifications.create({
        user_id: m.user_id,
        title: `Family Consent Granted by ${m.member_name}`,
        title_ta: `${m.member_name} அனுமதி வழங்கியுள்ளார்`,
        message: `${m.member_name} (${m.relationship}) has approved sharing LPG connection details. You can now monitor refills and book on their behalf.`,
        message_ta: `${m.member_name} எரிவாயு இணைப்பு விவரங்களை பகிர்ந்து கொள்ள ஒப்புதல் அளித்துள்ளார்.`,
        notification_type: 'family_consent',
        channel: 'all',
        reference_id: token,
      });
    }

    return res.json({
      success: true,
      message: decision === 'granted'
        ? 'Consent granted! The connection is now linked to the Family Gas Hub.'
        : 'Consent request declined. No data will be shared.',
      messageTa: decision === 'granted'
        ? 'அனுமதி வெற்றிகரமாக வழங்கப்பட்டது.'
        : 'அனுமதி மறுக்கப்பட்டது.',
      consentStatus: decision,
    });
  } catch (err) {
    console.error('Error responding to consent:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Revoke Consent
 */
async function revokeConsent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    await db.family.findOneAndUpdate(
      { _id: id, user_id: userId },
      { consent_status: 'revoked' }
    );

    return res.json({
      success: true,
      message: 'Family member consent revoked.',
      messageTa: 'குடும்ப உறுப்பினர் அனுமதி திரும்பப் பெறப்பட்டது.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getFamilyMembers,
  inviteMember,
  getConsentDetails,
  respondToConsent,
  revokeConsent,
};
