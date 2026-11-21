require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const GasProvider = require('../models/GasProvider');
const ConsumerConnection = require('../models/ConsumerConnection');
const RefillBooking = require('../models/RefillBooking');
const FamilyMember = require('../models/FamilyMember');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bharat_gas_db';
  console.log('🔄 Connecting to MongoDB at:', mongoUri);

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      GasProvider.deleteMany({}),
      ConsumerConnection.deleteMany({}),
      RefillBooking.deleteMany({}),
      FamilyMember.deleteMany({}),
      Notification.deleteMany({}),
      SupportTicket.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database collections.');

    // 1. Providers
    const providers = await GasProvider.insertMany([
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
    ]);
    console.log('✅ Seeded Gas Providers.');

    // 2. Users
    const passHash = await bcrypt.hash('Password@123', 10);
    const citizen = await User.create({
      full_name: 'Anandan Selvaraj',
      email: 'citizen@bharatgas.gov.in',
      mobile_number: '9876543210',
      password_hash: passHash,
      role: 'citizen',
      language: 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
      is_verified: true,
    });

    const admin = await User.create({
      full_name: 'Officer Rajesh Kumar (LPG Admin)',
      email: 'admin@bharatgas.gov.in',
      mobile_number: '9876500000',
      password_hash: passHash,
      role: 'admin',
      language: 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
      is_verified: true,
    });
    console.log('✅ Seeded Users (Citizen Anandan & Admin Officer Rajesh).');

    // 3. Connections
    const conn1 = await ConsumerConnection.create({
      user_id: citizen._id,
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
      consent_status: 'not_required',
    });

    const conn2 = await ConsumerConnection.create({
      user_id: citizen._id,
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
      consent_status: 'granted',
      consent_granted_at: new Date('2025-07-10'),
    });
    console.log('✅ Seeded LPG Consumer Connections.');

    // 4. Bookings
    await RefillBooking.insertMany([
      {
        booking_reference: 'BK-IND-2026-88102',
        connection_id: conn1._id,
        user_id: citizen._id,
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
        subsidy_status: 'pending',
        subsidy_amount: 200.00,
      },
      {
        booking_reference: 'BK-IND-2026-64192',
        connection_id: conn1._id,
        user_id: citizen._id,
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
        subsidy_status: 'credited',
        subsidy_amount: 200.00,
        subsidy_utr_no: 'UTR-SBI-2026-991829',
        subsidy_credited_at: new Date(Date.now() - 31 * 86400000),
      },
    ]);
    console.log('✅ Seeded Refill Bookings.');

    // 5. Family
    await FamilyMember.create({
      user_id: citizen._id,
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
    });

    console.log('🎉 [MongoDB Seed Complete] All collections ready.');
  } catch (err) {
    console.error('❌ [MongoDB Seed Error]:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
