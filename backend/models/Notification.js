const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    title_ta: { type: String, required: true },
    message: { type: String, required: true },
    message_ta: { type: String, required: true },
    notification_type: {
      type: String,
      enum: ['booking_status', 'refill_reminder', 'delivery_update', 'family_consent', 'subsidy_alert', 'general'],
      default: 'general',
    },
    channel: { type: String, enum: ['in_app', 'email', 'fcm', 'all'], default: 'all' },
    reference_id: { type: String, default: null },
    is_read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

notificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
