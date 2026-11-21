const db = require('../config/db');

/**
 * Create a Support / Emergency Grievance Ticket
 */
async function createTicket(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { subject, category = 'general', description, priority = 'medium' } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Subject and Description are required.',
        errorTa: 'தலைப்பு மற்றும் விவரம் தேவை.',
      });
    }

    const ticketNo = `TCK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectivePriority = category === 'gas_leak_emergency' ? 'critical' : priority;

    const newTicket = await db.tickets.create({
      ticket_no: ticketNo,
      user_id: userId,
      subject,
      category,
      priority: effectivePriority,
      status: 'open',
      description,
    });

    if (category === 'gas_leak_emergency') {
      await db.notifications.create({
        user_id: userId,
        title: '⚠️ Emergency Gas Leak Report Logged',
        title_ta: '⚠️ எரிவாயுக் கசிவு புகார் பதிவானது',
        message: `Your emergency leak report (${ticketNo}) is flagged CRITICAL. Immediate protocol initiated. Call 1906 for instant emergency response.`,
        message_ta: `உங்கள் அவசர புகார் பதிவானது. உடனடி உதவிக்கு 1906 என்ற எண்ணை அழைக்கவும்.`,
        notification_type: 'general',
        channel: 'all',
        reference_id: ticketNo,
      });
    }

    return res.status(201).json({
      success: true,
      message: category === 'gas_leak_emergency'
        ? 'CRITICAL: Gas Leak Ticket logged. Please call 1906 Emergency Helpline immediately!'
        : 'Support ticket submitted successfully.',
      messageTa: category === 'gas_leak_emergency'
        ? 'அவசர புகார் பதிவானது! உடனடியாக 1906 எண்ணை அழைக்கவும்!'
        : 'புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
      ticketNo,
      ticketId: newTicket._id || newTicket.id,
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get Citizen's Own Support Tickets
 */
async function getMyTickets(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const tickets = await db.tickets.find({ user_id: userId });

    return res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createTicket,
  getMyTickets,
};
