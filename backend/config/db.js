const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Mongoose Models
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const GasProvider = require('../models/GasProvider');
const ConsumerConnection = require('../models/ConsumerConnection');
const RefillBooking = require('../models/RefillBooking');
const FamilyMember = require('../models/FamilyMember');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');

let isConnectedToMongo = false;

// Pre-seeded Indian LPG records
const seedProviders = [
  {
    id: 'indane',
    display_name: 'Indane Gas',
    display_name_ta: 'இண்டேன் காஸ்',
    company_name: 'Indian Oil Corporation Ltd (IOCL)',
    logo_badge: 'IOCL-IND',
    primary_color: '#EA580C',
    cylinder_price_14kg: 803.00,
    cylinder_price_5kg: 310.00,
    cylinder_price_19kg: 1740.50,
    subsidy_rate: 200.00,
    emergency_helpline: '1906',
    toll_free_helpline: '1800-233-3555',
    api_status: 'mock_sandbox',
    is_active: true,
  },
  {
    id: 'bharat_gas',
    display_name: 'Bharat Gas',
    display_name_ta: 'பாரத் கேஸ்',
    company_name: 'Bharat Petroleum Corporation Ltd (BPCL)',
    logo_badge: 'BPCL-BHT',
    primary_color: '#EAB308',
    cylinder_price_14kg: 802.50,
    cylinder_price_5kg: 315.00,
    cylinder_price_19kg: 1738.00,
    subsidy_rate: 200.00,
    emergency_helpline: '1906',
    toll_free_helpline: '1800-22-4344',
    api_status: 'mock_sandbox',
    is_active: true,
  },
  {
    id: 'hp_gas',
    display_name: 'HP Gas',
    display_name_ta: 'ஹெச்பி கேஸ்',
    company_name: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    logo_badge: 'HPCL-HPG',
    primary_color: '#2563EB',
    cylinder_price_14kg: 803.00,
    cylinder_price_5kg: 308.00,
    cylinder_price_19kg: 1745.00,
    subsidy_rate: 200.00,
    emergency_helpline: '1906',
    toll_free_helpline: '1800-233-3777',
    api_status: 'mock_sandbox',
    is_active: true,
  },
];

// In-Memory Document Store for Sandbox Fallback
let inMemoryStore = {
  users: [
    {
      _id: '674011223344556677889901',
      id: '674011223344556677889901',
      full_name: 'Anandan Selvaraj',
      email: 'citizen@bharatgas.gov.in',
      mobile_number: '9876543210',
      password_hash: bcrypt.hashSync('Password@123', 10),
      role: 'citizen',
      language: 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
      fcm_token: null,
      is_verified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      _id: '674011223344556677889902',
      id: '674011223344556677889902',
      full_name: 'Officer Rajesh Kumar (LPG Admin)',
      email: 'admin@bharatgas.gov.in',
      mobile_number: '9876500000',
      password_hash: bcrypt.hashSync('Password@123', 10),
      role: 'admin',
      language: 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
      fcm_token: null,
      is_verified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      _id: '674011223344556677889903',
      id: '674011223344556677889903',
      full_name: 'Kavitha Anandan',
      email: 'kavitha.family@gmail.com',
      mobile_number: '9876543211',
      password_hash: bcrypt.hashSync('Password@123', 10),
      role: 'citizen',
      language: 'ta',
      state: 'Tamil Nadu',
      district: 'Madurai',
      fcm_token: null,
      is_verified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ],
  otp_verifications: [],
  gas_providers: [...seedProviders],
  consumer_connections: [
    {
      _id: '674022334455667788990001',
      id: '674022334455667788990001',
      user_id: '674011223344556677889901',
      provider_id: 'indane',
      consumer_number: 'IND-7009412',
      lpg_id_17digit: '17000010928374619',
      registered_mobile: '9876543210',
      consumer_name: 'Anandan Selvaraj',
      relationship_type: 'self',
      connection_status: 'active',
      cylinder_type: '14.2kg',
      distributor_code: 'IND-CHE-09',
      distributor_name: 'Sri Meenakshi Indane Vitrak',
      delivery_address: 'Flat 4B, Kaveri Towers, Anna Nagar West',
      district: 'Chennai',
      pincode: '600040',
      subsidy_eligible: true,
      bank_name: 'State Bank of India',
      masked_bank_acc: 'XXXX-XXXX-4819',
      ifsc_code: 'SBIN0004128',
      consent_status: 'not_required',
      consent_granted_at: null,
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
    },
    {
      _id: '674022334455667788990002',
      id: '674022334455667788990002',
      user_id: '674011223344556677889901',
      provider_id: 'bharat_gas',
      consumer_number: 'BHT-5541908',
      lpg_id_17digit: '18000030918237465',
      registered_mobile: '9876543211',
      consumer_name: 'Selvaraj Muthu (Father)',
      relationship_type: 'father',
      connection_status: 'active',
      cylinder_type: '14.2kg',
      distributor_code: 'BHT-MDU-14',
      distributor_name: 'Pandian Bharat Gas Agency',
      delivery_address: '12/4 East Veli Street, Simmakkal',
      district: 'Madurai',
      pincode: '625001',
      subsidy_eligible: true,
      bank_name: 'Canara Bank',
      masked_bank_acc: 'XXXX-XXXX-9902',
      ifsc_code: 'CNRB0001928',
      consent_status: 'granted',
      consent_granted_at: new Date('2025-07-10'),
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-01'),
    },
  ],
  refill_bookings: [
    {
      _id: '674033445566778899001101',
      id: '674033445566778899001101',
      booking_reference: 'BK-IND-2026-88102',
      connection_id: '674022334455667788990001',
      user_id: '674011223344556677889901',
      provider_id: 'indane',
      cylinder_type: '14.2kg',
      booking_date: new Date(Date.now() - 2 * 86400000),
      estimated_delivery_date: new Date(Date.now() + 1 * 86400000),
      actual_delivery_date: null,
      booking_status: 'out_for_delivery',
      amount_payable: 803.00,
      payment_mode: 'cod',
      payment_status: 'pending',
      delivery_person_name: 'Murugan Swamy',
      delivery_person_phone: '9840192837',
      delivery_otp: '8492',
      cancellation_reason: null,
      subsidy_status: 'pending',
      subsidy_amount: 200.00,
      subsidy_utr_no: null,
      subsidy_credited_at: null,
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(),
    },
    {
      _id: '674033445566778899001102',
      id: '674033445566778899001102',
      booking_reference: 'BK-IND-2026-64192',
      connection_id: '674022334455667788990001',
      user_id: '674011223344556677889901',
      provider_id: 'indane',
      cylinder_type: '14.2kg',
      booking_date: new Date(Date.now() - 34 * 86400000),
      estimated_delivery_date: new Date(Date.now() - 32 * 86400000),
      actual_delivery_date: new Date(Date.now() - 32 * 86400000),
      booking_status: 'delivered',
      amount_payable: 803.00,
      payment_mode: 'online_upi',
      payment_status: 'paid',
      delivery_person_name: 'Murugan Swamy',
      delivery_person_phone: '9840192837',
      delivery_otp: '3910',
      cancellation_reason: null,
      subsidy_status: 'credited',
      subsidy_amount: 200.00,
      subsidy_utr_no: 'UTR-SBI-2026-991829',
      subsidy_credited_at: new Date(Date.now() - 31 * 86400000),
      createdAt: new Date(Date.now() - 34 * 86400000),
      updatedAt: new Date(Date.now() - 31 * 86400000),
    },
    {
      _id: '674033445566778899001103',
      id: '674033445566778899001103',
      booking_reference: 'BK-IND-2026-41902',
      connection_id: '674022334455667788990001',
      user_id: '674011223344556677889901',
      provider_id: 'indane',
      cylinder_type: '14.2kg',
      booking_date: new Date(Date.now() - 68 * 86400000),
      estimated_delivery_date: new Date(Date.now() - 66 * 86400000),
      actual_delivery_date: new Date(Date.now() - 66 * 86400000),
      booking_status: 'delivered',
      amount_payable: 803.00,
      payment_mode: 'online_upi',
      payment_status: 'paid',
      delivery_person_name: 'R. Suresh',
      delivery_person_phone: '9840155221',
      delivery_otp: '6201',
      cancellation_reason: null,
      subsidy_status: 'credited',
      subsidy_amount: 200.00,
      subsidy_utr_no: 'UTR-SBI-2026-118274',
      subsidy_credited_at: new Date(Date.now() - 65 * 86400000),
      createdAt: new Date(Date.now() - 68 * 86400000),
      updatedAt: new Date(Date.now() - 65 * 86400000),
    },
    {
      _id: '674033445566778899001104',
      id: '674033445566778899001104',
      booking_reference: 'BK-BHT-2026-90184',
      connection_id: '674022334455667788990002',
      user_id: '674011223344556677889901',
      provider_id: 'bharat_gas',
      cylinder_type: '14.2kg',
      booking_date: new Date(Date.now() - 15 * 86400000),
      estimated_delivery_date: new Date(Date.now() - 13 * 86400000),
      actual_delivery_date: new Date(Date.now() - 13 * 86400000),
      booking_status: 'delivered',
      amount_payable: 802.50,
      payment_mode: 'cod',
      payment_status: 'paid',
      delivery_person_name: 'K. Manikandan',
      delivery_person_phone: '9443219082',
      delivery_otp: '5519',
      cancellation_reason: null,
      subsidy_status: 'credited',
      subsidy_amount: 200.00,
      subsidy_utr_no: 'UTR-CNR-2026-771829',
      subsidy_credited_at: new Date(Date.now() - 12 * 86400000),
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(Date.now() - 12 * 86400000),
    },
  ],
  family_members: [
    {
      _id: '674044556677889900112201',
      id: '674044556677889900112201',
      user_id: '674011223344556677889901',
      member_name: 'Selvaraj Muthu (Father)',
      relationship: 'father',
      mobile_number: '9876543211',
      email: 'selvaraj.muthu@gmail.com',
      provider_id: 'bharat_gas',
      consumer_number: 'BHT-5541908',
      consent_status: 'granted',
      consent_token: 'TOKEN-FATHER-GRANTED-991',
      permissions: { view_details: true, view_history: true, allow_booking: true },
      consent_date: new Date(Date.now() - 60 * 86400000),
      createdAt: new Date(Date.now() - 60 * 86400000),
    },
    {
      _id: '674044556677889900112202',
      id: '674044556677889900112202',
      user_id: '674011223344556677889901',
      member_name: 'Kavitha Anandan (Spouse)',
      relationship: 'spouse',
      mobile_number: '9876543212',
      email: 'kavitha.a@gmail.com',
      provider_id: 'hp_gas',
      consumer_number: 'HP-9902184',
      consent_status: 'pending',
      consent_token: 'TOKEN-SPOUSE-PENDING-442',
      permissions: { view_details: false, view_history: false, allow_booking: false },
      consent_date: null,
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  ],
  notifications: [
    {
      _id: '674055667788990011223301',
      id: '674055667788990011223301',
      user_id: '674011223344556677889901',
      title: 'Cylinder Out for Delivery!',
      title_ta: 'எரிவாயு உருளை டெலிவரிக்கு புறப்பட்டது!',
      message: 'Your Indane 14.2kg refill (BK-IND-2026-88102) is out for delivery with Murugan Swamy (9840192837). Verification PIN: 8492.',
      message_ta: 'உங்கள் இண்டேன் சிலிண்டர் (BK-IND-2026-88102) டெலிவரி முகவர் முருகன் சுவாமி மூலம் விநியோகத்திற்கு புறப்பட்டுள்ளது. டெலிவரி பின்: 8492.',
      notification_type: 'delivery_update',
      channel: 'all',
      reference_id: 'BK-IND-2026-88102',
      is_read: false,
      createdAt: new Date(Date.now() - 3 * 3600000),
    },
    {
      _id: '674055667788990011223302',
      id: '674055667788990011223302',
      user_id: '674011223344556677889901',
      title: 'Refill Reminder Alert',
      title_ta: 'மறு நிரப்பு நினைவூட்டல்',
      message: 'Smart Predictor: It has been 34 days since your last refill. Based on your household trend, book before stock depletes.',
      message_ta: 'சீர்மிகு கணிப்பு: கடந்த சிலிண்டர் டெலிவரியாகி 34 நாட்கள் ஆகின்றன. இருப்பு முடிவதற்குள் முன்பதிவு செய்யவும்.',
      notification_type: 'refill_reminder',
      channel: 'all',
      reference_id: '674022334455667788990001',
      is_read: false,
      createdAt: new Date(Date.now() - 12 * 3600000),
    },
    {
      _id: '674055667788990011223303',
      id: '674055667788990011223303',
      user_id: '674011223344556677889901',
      title: 'Subsidy Credited: ₹200',
      title_ta: 'மானியம் வரவு வைக்கப்பட்டது: ₹200',
      message: 'DBTL Subsidy of ₹200.00 has been transferred to SBI account ending in 4819 (UTR-SBI-2026-991829).',
      message_ta: 'ரூ.200 மானியம் உங்கள் பாரத ஸ்டேட் வங்கி கணக்கிற்கு (முடிவு எண் 4819) வரவு வைக்கப்பட்டது.',
      notification_type: 'subsidy_alert',
      channel: 'all',
      reference_id: 'UTR-SBI-2026-991829',
      is_read: true,
      createdAt: new Date(Date.now() - 31 * 86400000),
    },
  ],
  support_tickets: [
    {
      _id: '674066778899001122334401',
      id: '674066778899001122334401',
      ticket_no: 'TCK-2026-00491',
      user_id: '674011223344556677889901',
      subject: 'Gas Smell Near Cylinder Valve - Immediate Inspection',
      category: 'gas_leak_emergency',
      priority: 'critical',
      status: 'in_progress',
      description: 'Mild smell noticed around regulator joint after fixing safety cap. Emergency helpline 1906 notified.',
      resolution_notes: 'Distributor emergency response vehicle dispatched at 12:35 PM.',
      createdAt: new Date(Date.now() - 4 * 3600000),
      updatedAt: new Date(Date.now() - 2 * 3600000),
    },
  ],
  audit_logs: [],
};

/**
 * Initialize MongoDB connection
 */
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bharat_gas_db';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log(`✅ [MongoDB Engine] Connected to MongoDB at ${mongoUri}`);

    // Auto-seed providers if collection is empty
    const count = await GasProvider.countDocuments();
    if (count === 0) {
      await GasProvider.insertMany(seedProviders);
      console.log('🌱 [MongoDB Seed] Initialized LPG Providers (Indane, Bharat Gas, HP Gas).');
    }
  } catch (err) {
    isConnectedToMongo = false;
    console.log('\n======================================================');
    console.log('🛡️ [MongoDB Engine] Notice:');
    console.log(`   Live MongoDB daemon not active on ${mongoUri} (${err.message}).`);
    console.log('   Seamlessly activated Bharat Scheme Standalone MongoDB Sandbox Engine');
    console.log('   Pre-seeded with realistic Indian LPG records (Indane, Bharat Gas, HP Gas).');
    console.log('   Run `npm run db:seed` when local MongoDB daemon or MongoDB Atlas is available.');
    console.log('======================================================\n');
  }
}

// Helpers for unified document operations (works seamlessly with live Mongo or sandbox store)
const db = {
  initDatabase,
  isMongoLive: () => isConnectedToMongo,
  isFallback: () => !isConnectedToMongo,
  getStore: () => inMemoryStore,

  // Users
  users: {
    find: async (filter = {}) => {
      if (isConnectedToMongo) return User.find(filter).lean();
      return inMemoryStore.users.filter((u) => {
        if (filter.role && u.role !== filter.role) return false;
        if (filter.mobile_number && u.mobile_number !== filter.mobile_number) return false;
        if (filter.email && u.email.toLowerCase() !== filter.email.toLowerCase()) return false;
        return true;
      });
    },
    findById: async (id) => {
      const sId = String(id);
      if (isConnectedToMongo) return User.findById(id).lean();
      return inMemoryStore.users.find((u) => String(u._id) === sId || String(u.id) === sId) || null;
    },
    findOne: async (filter) => {
      if (isConnectedToMongo) return User.findOne(filter).lean();
      return inMemoryStore.users.find((u) => {
        if (filter.mobile_number && u.mobile_number === filter.mobile_number) return true;
        if (filter.email && u.email.toLowerCase() === filter.email.toLowerCase()) return true;
        if (filter._id && (String(u._id) === String(filter._id) || String(u.id) === String(filter._id))) return true;
        if (filter.$or) {
          return filter.$or.some((cond) => {
            if (cond.mobile_number && u.mobile_number === cond.mobile_number) return true;
            if (cond.email && u.email.toLowerCase() === cond.email.toLowerCase()) return true;
            return false;
          });
        }
        return false;
      }) || null;
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await User.create(data)).toObject();
      const newU = {
        _id: `user_${Date.now()}`,
        id: `user_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.users.push(newU);
      return newU;
    },
    findByIdAndUpdate: async (id, update) => {
      const sId = String(id);
      if (isConnectedToMongo) return User.findByIdAndUpdate(id, update, { new: true }).lean();
      const u = inMemoryStore.users.find((usr) => String(usr._id) === sId || String(usr.id) === sId);
      if (u) {
        Object.assign(u, update, { updatedAt: new Date() });
      }
      return u;
    },
  },

  // Gas Providers
  providers: {
    find: async (filter = {}) => {
      if (isConnectedToMongo) return GasProvider.find(filter).lean();
      return inMemoryStore.gas_providers.filter((p) => {
        if (filter.is_active !== undefined && p.is_active !== filter.is_active) return false;
        return true;
      });
    },
    findOne: async (filter) => {
      if (isConnectedToMongo) return GasProvider.findOne(filter).lean();
      return inMemoryStore.gas_providers.find((p) => p.id === filter.id) || null;
    },
    findOneAndUpdate: async (filter, update) => {
      if (isConnectedToMongo) return GasProvider.findOneAndUpdate(filter, update, { new: true }).lean();
      const p = inMemoryStore.gas_providers.find((prov) => prov.id === filter.id);
      if (p) Object.assign(p, update);
      return p;
    },
  },

  // Consumer Connections
  connections: {
    find: async (filter = {}) => {
      const enrich = (conn) => {
        const prov = inMemoryStore.gas_providers.find((p) => p.id === conn.provider_id) || inMemoryStore.gas_providers[0];
        return {
          ...conn,
          provider_name: prov.display_name,
          provider_name_ta: prov.display_name_ta,
          logo_badge: prov.logo_badge,
          primary_color: prov.primary_color,
          cylinder_price_14kg: Number(prov.cylinder_price_14kg || 803.00),
          cylinder_price_5kg: Number(prov.cylinder_price_5kg || 310.00),
          cylinder_price_19kg: Number(prov.cylinder_price_19kg || 1740.00),
          subsidy_rate: Number(prov.subsidy_rate || 200.00),
          emergency_helpline: prov.emergency_helpline || '1906',
          toll_free_helpline: prov.toll_free_helpline || '1800-233-3555',
        };
      };

      if (isConnectedToMongo) {
        const list = await ConsumerConnection.find(filter).sort({ createdAt: -1 }).lean();
        return list.map(enrich);
      }

      return inMemoryStore.consumer_connections
        .filter((c) => {
          if (filter.user_id && String(c.user_id) !== String(filter.user_id)) return false;
          if (filter.consumer_number && c.consumer_number.toUpperCase() !== String(filter.consumer_number).toUpperCase()) return false;
          return true;
        })
        .map(enrich);
    },
    findById: async (id) => {
      const sId = String(id);
      const enrich = (conn) => {
        if (!conn) return null;
        const prov = inMemoryStore.gas_providers.find((p) => p.id === conn.provider_id) || inMemoryStore.gas_providers[0];
        return {
          ...conn,
          provider_name: prov.display_name,
          provider_name_ta: prov.display_name_ta,
          company_name: prov.company_name,
          logo_badge: prov.logo_badge,
          primary_color: prov.primary_color,
          cylinder_price_14kg: Number(prov.cylinder_price_14kg || 803.00),
          cylinder_price_5kg: Number(prov.cylinder_price_5kg || 310.00),
          cylinder_price_19kg: Number(prov.cylinder_price_19kg || 1740.00),
          subsidy_rate: Number(prov.subsidy_rate || 200.00),
          emergency_helpline: prov.emergency_helpline || '1906',
          toll_free_helpline: prov.toll_free_helpline || '1800-233-3555',
        };
      };

      if (isConnectedToMongo) {
        const conn = await ConsumerConnection.findById(id).lean();
        return enrich(conn);
      }
      const c = inMemoryStore.consumer_connections.find((conn) => String(conn._id) === sId || String(conn.id) === sId);
      return enrich(c);
    },
    findOne: async (filter) => {
      if (isConnectedToMongo) return ConsumerConnection.findOne(filter).lean();
      return inMemoryStore.consumer_connections.find((c) => {
        if (filter.user_id && String(c.user_id) !== String(filter.user_id)) return false;
        if (filter.provider_id && c.provider_id !== filter.provider_id) return false;
        if (filter.consumer_number && c.consumer_number.toUpperCase() !== String(filter.consumer_number).toUpperCase()) return false;
        return true;
      }) || null;
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await ConsumerConnection.create(data)).toObject();
      const newC = {
        _id: `conn_${Date.now()}`,
        id: `conn_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.consumer_connections.unshift(newC);
      return newC;
    },
    deleteOne: async (filter) => {
      if (isConnectedToMongo) return ConsumerConnection.deleteOne(filter);
      const sId = String(filter._id || filter.id);
      inMemoryStore.consumer_connections = inMemoryStore.consumer_connections.filter((c) => String(c._id) !== sId && String(c.id) !== sId);
      return { deletedCount: 1 };
    },
  },

  // Refill Bookings
  bookings: {
    find: async (filter = {}) => {
      const enrich = (b) => {
        const c = inMemoryStore.consumer_connections.find((conn) => String(conn._id) === String(b.connection_id) || String(conn.id) === String(b.connection_id)) || inMemoryStore.consumer_connections[0];
        const p = inMemoryStore.gas_providers.find((prov) => prov.id === (b.provider_id || c?.provider_id)) || inMemoryStore.gas_providers[0];
        return {
          ...b,
          consumer_number: c?.consumer_number || 'IND-7009412',
          consumer_name: c?.consumer_name || 'Anandan Selvaraj',
          delivery_address: c?.delivery_address || 'Flat 4B, Kaveri Towers, Anna Nagar West',
          district: c?.district || 'Chennai',
          pincode: c?.pincode || '600040',
          distributor_name: c?.distributor_name || 'Sri Meenakshi Indane Vitrak',
          distributor_code: c?.distributor_code || 'DIST-01',
          registered_mobile: c?.registered_mobile || '9876543210',
          provider_name: p.display_name,
          provider_name_ta: p.display_name_ta,
          company_name: p.company_name,
          logo_badge: p.logo_badge,
          primary_color: p.primary_color,
          emergency_helpline: p.emergency_helpline || '1906',
          amount_payable: Number(b.amount_payable || p.cylinder_price_14kg || 803.00),
        };
      };

      if (isConnectedToMongo) {
        const list = await RefillBooking.find(filter).sort({ booking_date: -1 }).lean();
        return list.map(enrich);
      }

      return inMemoryStore.refill_bookings
        .filter((b) => {
          if (filter.user_id && String(b.user_id) !== String(filter.user_id)) return false;
          if (filter.connection_id && String(b.connection_id) !== String(filter.connection_id)) return false;
          if (filter.booking_status && b.booking_status !== filter.booking_status) return false;
          return true;
        })
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .map(enrich);
    },
    findOne: async (filter) => {
      const enrich = (b) => {
        if (!b) return null;
        const c = inMemoryStore.consumer_connections.find((conn) => String(conn._id) === String(b.connection_id) || String(conn.id) === String(b.connection_id)) || inMemoryStore.consumer_connections[0];
        const p = inMemoryStore.gas_providers.find((prov) => prov.id === (b.provider_id || c?.provider_id)) || inMemoryStore.gas_providers[0];
        return {
          ...b,
          consumer_number: c?.consumer_number || 'IND-7009412',
          consumer_name: c?.consumer_name || 'Anandan Selvaraj',
          delivery_address: c?.delivery_address || 'Flat 4B, Kaveri Towers, Anna Nagar West',
          district: c?.district || 'Chennai',
          pincode: c?.pincode || '600040',
          distributor_name: c?.distributor_name || 'Sri Meenakshi Indane Vitrak',
          distributor_code: c?.distributor_code || 'DIST-01',
          registered_mobile: c?.registered_mobile || '9876543210',
          provider_name: p.display_name,
          provider_name_ta: p.display_name_ta,
          company_name: p.company_name,
          logo_badge: p.logo_badge,
          primary_color: p.primary_color,
          emergency_helpline: p.emergency_helpline || '1906',
          amount_payable: Number(b.amount_payable || p.cylinder_price_14kg || 803.00),
        };
      };

      if (isConnectedToMongo) {
        const b = await RefillBooking.findOne(filter).lean();
        return enrich(b);
      }

      const b = inMemoryStore.refill_bookings.find((bk) => {
        if (filter.booking_reference && bk.booking_reference === filter.booking_reference) return true;
        if (filter._id && (String(bk._id) === String(filter._id) || String(bk.id) === String(filter._id))) return true;
        return false;
      });
      return enrich(b);
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await RefillBooking.create(data)).toObject();
      const newB = {
        _id: `booking_${Date.now()}`,
        id: `booking_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.refill_bookings.unshift(newB);
      return newB;
    },
    findOneAndUpdate: async (filter, update) => {
      if (isConnectedToMongo) return RefillBooking.findOneAndUpdate(filter, update, { new: true }).lean();
      const b = inMemoryStore.refill_bookings.find((bk) => bk.booking_reference === filter.booking_reference);
      if (b) {
        Object.assign(b, update, { updatedAt: new Date() });
      }
      return b;
    },
  },

  // Family Members
  family: {
    find: async (filter = {}) => {
      const enrich = (f) => {
        const p = inMemoryStore.gas_providers.find((prov) => prov.id === f.provider_id) || inMemoryStore.gas_providers[0];
        const u = inMemoryStore.users.find((usr) => String(usr._id) === String(f.user_id) || String(usr.id) === String(f.user_id)) || inMemoryStore.users[0];
        return {
          ...f,
          provider_name: p.display_name,
          provider_name_ta: p.display_name_ta,
          logo_badge: p.logo_badge,
          primary_color: p.primary_color,
          inviter_name: u?.full_name || 'Citizen Anandan',
          inviter_mobile: u?.mobile_number || '9876543210',
        };
      };

      if (isConnectedToMongo) {
        const list = await FamilyMember.find(filter).sort({ createdAt: -1 }).lean();
        return list.map(enrich);
      }

      return inMemoryStore.family_members
        .filter((f) => {
          if (filter.user_id && String(f.user_id) !== String(filter.user_id)) return false;
          return true;
        })
        .map(enrich);
    },
    findOne: async (filter) => {
      const enrich = (f) => {
        if (!f) return null;
        const p = inMemoryStore.gas_providers.find((prov) => prov.id === f.provider_id) || inMemoryStore.gas_providers[0];
        const u = inMemoryStore.users.find((usr) => String(usr._id) === String(f.user_id) || String(usr.id) === String(f.user_id)) || inMemoryStore.users[0];
        return {
          ...f,
          provider_name: p.display_name,
          provider_name_ta: p.display_name_ta,
          logo_badge: p.logo_badge,
          primary_color: p.primary_color,
          inviter_name: u?.full_name || 'Citizen Anandan',
          inviter_mobile: u?.mobile_number || '9876543210',
        };
      };

      if (isConnectedToMongo) {
        const f = await FamilyMember.findOne(filter).lean();
        return enrich(f);
      }

      const f = inMemoryStore.family_members.find((fam) => {
        if (filter.consent_token && fam.consent_token === filter.consent_token) return true;
        if (filter._id && (String(fam._id) === String(filter._id) || String(fam.id) === String(filter._id))) return true;
        return false;
      });
      return enrich(f);
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await FamilyMember.create(data)).toObject();
      const newF = {
        _id: `fam_${Date.now()}`,
        id: `fam_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.family_members.unshift(newF);
      return newF;
    },
    findOneAndUpdate: async (filter, update) => {
      if (isConnectedToMongo) return FamilyMember.findOneAndUpdate(filter, update, { new: true }).lean();
      const f = inMemoryStore.family_members.find((fam) => fam.consent_token === filter.consent_token || String(fam._id) === String(filter._id));
      if (f) Object.assign(f, update, { updatedAt: new Date() });
      return f;
    },
    deleteOne: async (filter) => {
      if (isConnectedToMongo) return FamilyMember.deleteOne(filter);
      const sId = String(filter._id || filter.id);
      inMemoryStore.family_members = inMemoryStore.family_members.filter((f) => String(f._id) !== sId && String(f.id) !== sId);
      return { deletedCount: 1 };
    },
  },

  // Notifications
  notifications: {
    find: async (filter = {}) => {
      if (isConnectedToMongo) return Notification.find(filter).sort({ createdAt: -1 }).limit(30).lean();
      return inMemoryStore.notifications
        .filter((n) => {
          if (filter.user_id && String(n.user_id) !== String(filter.user_id)) return false;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await Notification.create(data)).toObject();
      const newN = {
        _id: `notif_${Date.now()}`,
        id: `notif_${Date.now()}`,
        ...data,
        is_read: false,
        createdAt: new Date(),
      };
      inMemoryStore.notifications.unshift(newN);
      return newN;
    },
    updateMany: async (filter, update) => {
      if (isConnectedToMongo) return Notification.updateMany(filter, update);
      inMemoryStore.notifications
        .filter((n) => !filter.user_id || String(n.user_id) === String(filter.user_id))
        .forEach((n) => Object.assign(n, update));
      return { modifiedCount: 1 };
    },
    findByIdAndUpdate: async (id, update) => {
      const sId = String(id);
      if (isConnectedToMongo) return Notification.findByIdAndUpdate(id, update, { new: true }).lean();
      const n = inMemoryStore.notifications.find((notif) => String(notif._id) === sId || String(notif.id) === sId);
      if (n) Object.assign(n, update);
      return n;
    },
  },

  // Support Tickets
  tickets: {
    find: async (filter = {}) => {
      const enrich = (t) => {
        const u = inMemoryStore.users.find((usr) => String(usr._id) === String(t.user_id) || String(usr.id) === String(t.user_id));
        return {
          ...t,
          user_name: u?.full_name || 'Citizen Anandan',
          user_mobile: u?.mobile_number || '9876543210',
        };
      };

      if (isConnectedToMongo) {
        const list = await SupportTicket.find(filter).sort({ createdAt: -1 }).lean();
        return list.map(enrich);
      }

      return inMemoryStore.support_tickets
        .filter((t) => {
          if (filter.user_id && String(t.user_id) !== String(filter.user_id)) return false;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(enrich);
    },
    create: async (data) => {
      if (isConnectedToMongo) return (await SupportTicket.create(data)).toObject();
      const newT = {
        _id: `tkt_${Date.now()}`,
        id: `tkt_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.support_tickets.unshift(newT);
      return newT;
    },
    findByIdAndUpdate: async (id, update) => {
      const sId = String(id);
      if (isConnectedToMongo) return SupportTicket.findByIdAndUpdate(id, update, { new: true }).lean();
      const t = inMemoryStore.support_tickets.find((tkt) => String(tkt._id) === sId || String(tkt.id) === sId);
      if (t) Object.assign(t, update, { updatedAt: new Date() });
      return t;
    },
  },

  // OTP Verifications
  otps: {
    create: async (data) => {
      if (isConnectedToMongo) return (await OtpVerification.create(data)).toObject();
      const newO = { _id: `otp_${Date.now()}`, ...data, createdAt: new Date() };
      inMemoryStore.otp_verifications.push(newO);
      return newO;
    },
    findLatest: async (email, purpose) => {
      if (isConnectedToMongo) {
        return OtpVerification.findOne({ email: email.toLowerCase(), purpose, is_used: false })
          .sort({ createdAt: -1 }).lean();
      }
      return inMemoryStore.otp_verifications
        .filter((o) => o.email === email.toLowerCase() && o.purpose === purpose && !o.is_used)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    },
    markUsed: async (id) => {
      if (isConnectedToMongo) return OtpVerification.findByIdAndUpdate(id, { is_used: true });
      const record = inMemoryStore.otp_verifications.find((item) => String(item._id) === String(id));
      if (record) record.is_used = true;
    },
  },
};

module.exports = db;
