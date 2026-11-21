const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    member_name: { type: String, required: true },
    relationship: { type: String, required: true },
    mobile_number: { type: String, required: true },
    email: { type: String, default: null },
    provider_id: { type: String, required: true },
    consumer_number: { type: String, required: true },
    consent_status: {
      type: String,
      enum: ['pending', 'granted', 'rejected', 'revoked'],
      default: 'pending',
    },
    consent_token: { type: String, required: true, unique: true },
    permissions: {
      view_details: { type: Boolean, default: true },
      view_history: { type: Boolean, default: true },
      allow_booking: { type: Boolean, default: true },
    },
    consent_date: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

familyMemberSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
familyMemberSchema.set('toJSON', { virtuals: true });
familyMemberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
