const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile_number: { type: String, required: false, unique: true, sparse: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    language: { type: String, enum: ['en', 'ta'], default: 'en' },
    state: { type: String, default: 'Tamil Nadu' },
    district: { type: String, default: 'Chennai' },
    fcm_token: { type: String, default: null },
    is_verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Virtual id for JSON output
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
