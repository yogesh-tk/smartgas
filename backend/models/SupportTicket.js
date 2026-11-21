const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    ticket_no: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['gas_leak_emergency', 'delayed_delivery', 'subsidy_issue', 'kyc_verification', 'meter_cylinder_defect', 'general'],
      default: 'general',
    },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    description: { type: String, required: true },
    resolution_notes: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
supportTicketSchema.set('toJSON', { virtuals: true });
supportTicketSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
