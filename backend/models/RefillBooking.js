const mongoose = require('mongoose');

const refillBookingSchema = new mongoose.Schema(
  {
    booking_reference: { type: String, required: true, unique: true },
    connection_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumerConnection', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider_id: { type: String, required: true },
    cylinder_type: { type: String, default: '14.2kg' },
    booking_date: { type: Date, default: Date.now },
    estimated_delivery_date: { type: Date, required: true },
    actual_delivery_date: { type: Date, default: null },
    booking_status: {
      type: String,
      enum: ['booking_pending', 'booking_confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'booking_confirmed',
    },
    amount_payable: { type: Number, required: true },
    payment_mode: { type: String, enum: ['cod', 'online_upi', 'netbanking', 'wallet'], default: 'cod' },
    payment_status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    delivery_person_name: { type: String, default: 'Murugan Swamy' },
    delivery_person_phone: { type: String, default: '9840192837' },
    delivery_otp: { type: String, default: '8492' },
    cancellation_reason: { type: String, default: null },
    subsidy_status: { type: String, enum: ['pending', 'credited', 'not_applicable'], default: 'pending' },
    subsidy_amount: { type: Number, default: 200.00 },
    subsidy_utr_no: { type: String, default: null },
    subsidy_credited_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

refillBookingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
refillBookingSchema.set('toJSON', { virtuals: true });
refillBookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RefillBooking', refillBookingSchema);
