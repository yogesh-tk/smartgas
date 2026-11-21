-- ====================================================================
-- Bharat Scheme (பாரத் திட்டம்) - Initial Seed Data
-- ====================================================================

USE bharat_gas_db;

-- Insert LPG Providers
INSERT INTO gas_providers (id, display_name, display_name_ta, company_name, logo_badge, primary_color, cylinder_price_14kg, cylinder_price_5kg, cylinder_price_19kg, subsidy_rate, emergency_helpline, toll_free_helpline, api_status)
VALUES 
('indane', 'Indane Gas', 'இண்டேன் காஸ்', 'Indian Oil Corporation Ltd (IOCL)', 'IOCL-IND', '#EA580C', 803.00, 310.00, 1740.50, 200.00, '1906', '1800-233-3555', 'mock_sandbox'),
('bharat_gas', 'Bharat Gas', 'பாரத் கேஸ்', 'Bharat Petroleum Corporation Ltd (BPCL)', 'BPCL-BHT', '#EAB308', 802.50, 315.00, 1738.00, 200.00, '1906', '1800-22-4344', 'mock_sandbox'),
('hp_gas', 'HP Gas', 'ஹெச்பி கேஸ்', 'Hindustan Petroleum Corporation Ltd (HPCL)', 'HPCL-HPG', '#2563EB', 803.00, 308.00, 1745.00, 200.00, '1906', '1800-233-3777', 'mock_sandbox')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Default Demo Passwords (bcrypt hash of 'Password@123': $2b$10$r9GgHwQ7G/JslFzT7a7b8e5vS9g8xN4wzQ1R6I5k8M9v5mF1a)
-- 1. Demo Citizen User: Anandan Selvaraj (9876543210, citizen@bharatgas.gov.in)
-- 2. Demo Admin User: Officer Rajesh Kumar (9876500000, admin@bharatgas.gov.in)
INSERT INTO users (id, full_name, email, mobile_number, password_hash, role, language, state, district, is_verified)
VALUES
(1, 'Anandan Selvaraj', 'citizen@bharatgas.gov.in', '9876543210', '$2a$10$w4C3z3P3uQpI1Z4k7kS3e.V5G7N8r9p4F2e1m9O8L7v6X5y4Z3A2B', 'citizen', 'en', 'Tamil Nadu', 'Chennai', 1),
(2, 'Officer Rajesh Kumar (LPG Admin)', 'admin@bharatgas.gov.in', '9876500000', '$2a$10$w4C3z3P3uQpI1Z4k7kS3e.V5G7N8r9p4F2e1m9O8L7v6X5y4Z3A2B', 'admin', 'en', 'Tamil Nadu', 'Chennai', 1),
(3, 'Kavitha Anandan', 'kavitha.family@gmail.com', '9876543211', '$2a$10$w4C3z3P3uQpI1Z4k7kS3e.V5G7N8r9p4F2e1m9O8L7v6X5y4Z3A2B', 'citizen', 'ta', 'Tamil Nadu', 'Madurai', 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Insert Demo Consumer Connections for User 1 (Anandan)
INSERT INTO consumer_connections (id, user_id, provider_id, consumer_number, lpg_id_17digit, registered_mobile, consumer_name, relationship_type, connection_status, cylinder_type, distributor_code, distributor_name, delivery_address, district, pincode, subsidy_eligible, bank_name, masked_bank_acc, ifsc_code, consent_status)
VALUES
(1, 1, 'indane', 'IND-7009412', '17000010928374619', '9876543210', 'Anandan Selvaraj', 'self', 'active', '14.2kg', 'IND-CHE-09', 'Sri Meenakshi Indane Vitrak', 'Flat 4B, Kaveri Towers, Anna Nagar West', 'Chennai', '600040', 1, 'State Bank of India', 'XXXX-XXXX-4819', 'SBIN0004128', 'not_required'),
(2, 1, 'bharat_gas', 'BHT-5541908', '18000030918237465', '9876543211', 'Selvaraj M (Father)', 'father', 'active', '14.2kg', 'BHT-MDU-14', 'Pandian Bharat Gas Agency', '12/4 East Veli Street, Simmakkal', 'Madurai', '625001', 1, 'Canara Bank', 'XXXX-XXXX-9902', 'CNRB0001928', 'granted')
ON DUPLICATE KEY UPDATE consumer_number = VALUES(consumer_number);

-- Insert Demo Refill Bookings
INSERT INTO refill_bookings (id, booking_reference, connection_id, user_id, provider_id, cylinder_type, booking_date, estimated_delivery_date, actual_delivery_date, booking_status, amount_payable, payment_mode, payment_status, delivery_person_name, delivery_person_phone, delivery_otp, subsidy_status, subsidy_amount, subsidy_utr_no, subsidy_credited_at)
VALUES
(1, 'BK-IND-2026-88102', 1, 1, 'indane', '14.2kg', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), NULL, 'out_for_delivery', 803.00, 'cod', 'pending', 'Murugan Swamy', '9840192837', '8492', 'pending', 200.00, NULL, NULL),
(2, 'BK-IND-2026-64192', 1, 1, 'indane', '14.2kg', DATE_SUB(NOW(), INTERVAL 34 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY), 'delivered', 803.00, 'online_upi', 'paid', 'Murugan Swamy', '9840192837', '3910', 'credited', 200.00, 'UTR-SBI-2026-991829', DATE_SUB(NOW(), INTERVAL 31 DAY)),
(3, 'BK-IND-2026-41902', 1, 1, 'indane', '14.2kg', DATE_SUB(NOW(), INTERVAL 68 DAY), DATE_SUB(NOW(), INTERVAL 66 DAY), DATE_SUB(NOW(), INTERVAL 66 DAY), 'delivered', 803.00, 'online_upi', 'paid', 'R. Suresh', '9840155221', '6201', 'credited', 200.00, 'UTR-SBI-2026-118274', DATE_SUB(NOW(), INTERVAL 65 DAY)),
(4, 'BK-BHT-2026-90184', 2, 1, 'bharat_gas', '14.2kg', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), 'delivered', 802.50, 'cod', 'paid', 'K. Manikandan', '9443219082', '5519', 'credited', 200.00, 'UTR-CNR-2026-771829', DATE_SUB(NOW(), INTERVAL 12 DAY))
ON DUPLICATE KEY UPDATE booking_reference = VALUES(booking_reference);

-- Insert Demo Family Members
INSERT INTO family_members (id, user_id, member_name, relationship, mobile_number, email, provider_id, consumer_number, consent_status, consent_token, permissions, consent_date)
VALUES
(1, 1, 'Selvaraj Muthu (Father)', 'father', '9876543211', 'selvaraj.muthu@gmail.com', 'bharat_gas', 'BHT-5541908', 'granted', 'TOKEN-FATHER-GRANTED-991', '{"view_details": true, "view_history": true, "allow_booking": true}', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(2, 1, 'Kavitha Anandan (Spouse)', 'spouse', '9876543212', 'kavitha.a@gmail.com', 'hp_gas', 'HP-9902184', 'pending', 'TOKEN-SPOUSE-PENDING-442', '{"view_details": false, "view_history": false, "allow_booking": false}', NULL)
ON DUPLICATE KEY UPDATE member_name = VALUES(member_name);

-- Insert Demo Notifications
INSERT INTO notifications (id, user_id, title, title_ta, message, message_ta, notification_type, channel, reference_id, is_read)
VALUES
(1, 1, 'Cylinder Out for Delivery!', 'எரிவாயு உருளை டெலிவரிக்கு புறப்பட்டது!', 'Your Indane 14.2kg refill (BK-IND-2026-88102) is out for delivery with Murugan Swamy (9840192837). Verification PIN: 8492.', 'உங்கள் இண்டேன் சிலிண்டர் (BK-IND-2026-88102) டெலிவரி முகவர் முருகன் சுவாமி மூலம் விநியோகத்திற்கு புறப்பட்டுள்ளது. டெலிவரி பின்: 8492.', 'delivery_update', 'all', 'BK-IND-2026-88102', 0),
(2, 1, 'Refill Reminder Alert', 'மறு நிரப்பு நினைவூட்டல்', 'Smart Predictor: It has been 32 days since your last refill. Based on your household trend, book before stock depletes.', 'சீர்மிகு கணிப்பு: கடந்த சிலிண்டர் டெலிவரியாகி 32 நாட்கள் ஆகின்றன. இருப்பு முடிவதற்குள் முன்பதிவு செய்யவும்.', 'refill_reminder', 'all', '1', 0),
(3, 1, 'Subsidy Credited: ₹200', 'மானியம் வரவு வைக்கப்பட்டது: ₹200', 'DBTL Subsidy of ₹200.00 has been transferred to SBI account ending in 4819 (UTR-SBI-2026-991829).', 'ரூ.200 மானியம் உங்கள் பாரத ஸ்டேட் வங்கி கணக்கிற்கு (முடிவு எண் 4819) வரவு வைக்கப்பட்டது.', 'subsidy_alert', 'all', 'UTR-SBI-2026-991829', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert Demo Support Ticket
INSERT INTO support_tickets (id, ticket_no, user_id, subject, category, priority, status, description, resolution_notes)
VALUES
(1, 'TCK-2026-00491', 1, 'Gas Smell Near Cylinder Valve - Immediate Inspection', 'gas_leak_emergency', 'critical', 'in_progress', 'Mild smell noticed around regulator joint after fixing safety cap. Emergency helpline 1906 notified.', 'Distributor emergency response vehicle dispatched at 12:35 PM.')
ON DUPLICATE KEY UPDATE ticket_no = VALUES(ticket_no);
