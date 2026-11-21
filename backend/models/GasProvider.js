const mongoose = require('mongoose');

const gasProviderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true }, // 'indane' | 'bharat_gas' | 'hp_gas'
    display_name: { type: String, required: true },
    display_name_ta: { type: String, required: true },
    company_name: { type: String, required: true },
    logo_badge: { type: String, required: true },
    primary_color: { type: String, required: true },
    cylinder_price_14kg: { type: Number, default: 803.00 },
    cylinder_price_5kg: { type: Number, default: 310.00 },
    cylinder_price_19kg: { type: Number, default: 1740.00 },
    subsidy_rate: { type: Number, default: 200.00 },
    emergency_helpline: { type: String, default: '1906' },
    toll_free_helpline: { type: String, default: '1800-233-3555' },
    api_status: { type: String, enum: ['live', 'mock_sandbox', 'maintenance'], default: 'mock_sandbox' },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GasProvider', gasProviderSchema);
