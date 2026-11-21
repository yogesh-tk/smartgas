const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp_code: { type: String, required: true },
  purpose: { type: String, enum: ['email_registration', 'connection_link'], default: 'email_registration' },
  expires_at: { type: Date, required: true },
  is_used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

otpVerificationSchema.index({ email: 1, purpose: 1, is_used: 1 });
otpVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);