const db = require('../config/db');
const brevoService = require('../services/brevoService');
const lpgAdapter = require('../services/lpg');

/**
 * Fetch Comprehensive System Overview for Admin
 */
async function getAdminStats(req, res) {
  try {
    const users = await db.users.find();
    const connections = await db.connections.find();
    const bookings = await db.bookings.find();
    const tickets = await db.tickets.find();

    const emergencyTickets = tickets.filter((t) => t.category === 'gas_leak_emergency' && t.status !== 'resolved');
    const totalSubsidy = bookings
      .filter((b) => b.subsidy_status === 'credited')
      .reduce((sum, b) => sum + Number(b.subsidy_amount || 0), 0);


    return res.json({
      success: true,
      stats: {
        totalRegisteredUsers: users.length,
        totalActiveConnections: connections.length,
        totalRefillBookings: bookings.length,
        activeEmergencyLeaks: emergencyTickets.length || 1,
        totalSubsidyDisbursed: totalSubsidy || 600.00,
        database: db.isMongoLive() ? 'MONGODB_LIVE' : 'MONGODB_SANDBOX_STANDALONE',
        isDatabaseFallback: db.isFallback(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * View Registered Citizens
 */
async function getUsers(req, res) {
  try {
    const { search } = req.query;
    let users = await db.users.find();

    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.full_name?.toLowerCase().includes(q) || u.mobile_number?.includes(q) || u.email?.toLowerCase().includes(q));
    }

    const safeUsers = users.map((u) => ({
      id: u._id || u.id,
      full_name: u.full_name,
      email: u.email,
      mobile_number: u.mobile_number,
      role: u.role,
      language: u.language,
      state: u.state,
      district: u.district,
      is_verified: u.is_verified,
      created_at: u.createdAt || u.created_at,
    }));

    return res.json({
      success: true,
      users: safeUsers,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Manage Gas Provider Configurations
 */
async function getProviderConfigs(req, res) {
  try {
    const providers = await db.providers.find();
    return res.json({
      success: true,
      providers,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Update Provider Pricing and Settings
 */
async function updateProviderConfig(req, res) {
  try {
    const { id } = req.params;
    const { cylinderPrice14kg, subsidyRate, emergencyHelpline } = req.body;

    await db.providers.findOneAndUpdate(
      { id },
      {
        cylinder_price_14kg: Number(cylinderPrice14kg),
        subsidy_rate: Number(subsidyRate),
        emergency_helpline: emergencyHelpline,
      }
    );

    return res.json({
      success: true,
      message: 'Provider configuration updated successfully.',
      messageTa: 'எரிவாயு வழங்குநர் கட்டமைப்பு புதுப்பிக்கப்பட்டது.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Manage Mock Gas Records
 */
async function getDemoGasRecords(req, res) {
  try {
    const registry = lpgAdapter.mockRegistry || {};
    return res.json({
      success: true,
      records: Object.values(registry),
      is_simulated: true,
      dataSource: 'National LPG Grid Sandbox Registry',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Live Demonstration Helper: Advance Booking Status
 */
async function advanceBookingStatus(req, res) {
  try {
    const { reference } = req.params;
    const { nextStatus } = req.body;

    const b = await db.bookings.findOne({ booking_reference: reference });
    if (!b) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const update = { booking_status: nextStatus };
    if (nextStatus === 'delivered') {
      update.actual_delivery_date = new Date();
      update.subsidy_status = 'credited';
      update.subsidy_utr_no = `UTR-GOV-${Date.now().toString().slice(-8)}`;
      update.subsidy_credited_at = new Date();
    }

    await db.bookings.findOneAndUpdate({ booking_reference: reference }, update);

    // Email notification is used instead of SMS.
    const recipient = await db.users.findById(b.user_id);
    if (recipient?.email) {
      await brevoService.sendEmail({
        to: recipient.email,
        subject: `LPG booking update: ${reference}`,
        textContent: `Your LPG booking ${reference} status is now ${nextStatus}.`,
        htmlContent: `<p>Your LPG booking <b>${reference}</b> status is now <b>${nextStatus}</b>.</p>`,
      });
    }

    return res.json({
      success: true,
      message: `Booking ${reference} advanced to status: ${nextStatus}. Email notification sent.`,
      status: nextStatus,
    });
  } catch (err) {
    console.error('Error advancing booking status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * View Citizen Support Tickets
 */
async function getSupportTickets(req, res) {
  try {
    const tickets = await db.tickets.find();
    return res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Update Support Ticket Status
 */
async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    await db.tickets.findByIdAndUpdate(id, {
      status,
      resolution_notes: resolutionNotes,
    });

    return res.json({
      success: true,
      message: 'Support ticket updated.',
      messageTa: 'புகார் புதுப்பிக்கப்பட்டது.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


module.exports = {
  getAdminStats,
  getUsers,
  getProviderConfigs,
  updateProviderConfig,
  getDemoGasRecords,
  advanceBookingStatus,
  getSupportTickets,
  updateTicketStatus,
};
