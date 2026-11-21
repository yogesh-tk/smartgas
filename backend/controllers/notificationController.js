const db = require('../config/db');

/**
 * Fetch all notifications for citizen
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const notifs = await db.notifications.find({ user_id: userId });

    return res.json({
      success: true,
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.is_read).length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await db.notifications.findByIdAndUpdate(id, { is_read: true });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Mark all notifications as read
 */
async function markAllRead(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    await db.notifications.updateMany({ user_id: userId }, { is_read: true });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Smart Refill Prediction & Reminder Engine
 */
async function checkRefillReminders(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const conns = await db.connections.find({ user_id: userId });
    const remindersGenerated = [];

    for (const conn of conns) {
      const pastBookings = await db.bookings.find({
        connection_id: conn._id || conn.id,
        booking_status: 'delivered',
      });

      if (pastBookings && pastBookings.length > 0) {
        const lastDelivered = pastBookings[0];
        const deliveryDate = new Date(lastDelivered.actual_delivery_date || lastDelivered.booking_date || lastDelivered.createdAt);
        const daysElapsed = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 3600 * 24));
        const estimatedCycleDays = 32;
        const remainingDays = Math.max(0, estimatedCycleDays - daysElapsed);
        const remainingPercent = Math.max(5, Math.min(100, Math.round((remainingDays / estimatedCycleDays) * 100)));

        if (daysElapsed >= 25) {
          const recentNotifs = await db.notifications.find({
            user_id: userId,
            notification_type: 'refill_reminder',
          });

          const alreadyTriggered = recentNotifs.some((n) => n.reference_id === String(conn._id || conn.id));

          if (!alreadyTriggered) {
            await db.notifications.create({
              user_id: userId,
              title: `Smart Refill Reminder: ${conn.provider_name}`,
              title_ta: `சீர்மிகு எரிவாயு நினைவூட்டல்: ${conn.provider_name}`,
              message: `Your cylinder was delivered ${daysElapsed} days ago. Estimated remaining: ~${remainingPercent}% (${remainingDays} days). Book refill before delivery queue.`,
              message_ta: `சிலிண்டர் விநியோகிக்கப்பட்டு ${daysElapsed} நாட்கள் ஆகிறது. தோராய இருப்பு: ~${remainingPercent}%. இருப்பு தீரும் முன் முன்பதிவு செய்யவும்.`,
              notification_type: 'refill_reminder',
              channel: 'all',
              reference_id: String(conn._id || conn.id),
            });

            remindersGenerated.push({
              connectionId: conn._id || conn.id,
              provider: conn.provider_name,
              daysElapsed,
              remainingPercent,
              remainingDays,
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      remindersGenerated,
    });
  } catch (err) {
    console.error('Error checking refill reminders:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  checkRefillReminders,
};
