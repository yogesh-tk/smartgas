const mongoose = require('mongoose');

const consumerConnectionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider_id: { type: String, required: true }, // 'indane' | 'bharat_gas' | 'hp_gas'
    consumer_number: { type: String, required: true, trim: true },
    lpg_id_17digit: { type: String, trim: true },
    registered_mobile: { type: String, required: true, trim: true },
    consumer_name: { type: String, required: true },
    relationship_type: {
      type: String,
      enum: ['self', 'father', 'mother', 'spouse', 'son', 'daughter', 'sibling', 'other'],
      default: 'self',
    },
    connection_status: {
      type: String,
      enum: ['active', 'inactive', 'pending_verification', 'suspended'],
      default: 'active',
    },
    cylinder_type: { type: String, default: '14.2kg' },
    distributor_code: { type: String, default: 'DIST-01' },
    distributor_name: { type: String, required: true },
    delivery_address: { type: String, required: true },
    district: { type: String, default: 'Chennai' },
    pincode: { type: String, default: '600001' },
    subsidy_eligible: { type: Boolean, default: true },
    bank_name: { type: String, default: 'State Bank of India' },
    masked_bank_acc: { type: String, default: 'XXXX-XXXX-4819' },
    ifsc_code: { type: String, default: 'SBIN0004128' },
    consent_status: {
      type: String,
      enum: ['not_required', 'pending', 'granted', 'revoked'],
      default: 'not_required',
    },
    consent_granted_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

consumerConnectionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
consumerConnectionSchema.set('toJSON', { virtuals: true });
consumerConnectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ConsumerConnection', consumerConnectionSchema);
