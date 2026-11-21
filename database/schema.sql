-- ====================================================================
-- Bharat Scheme (பாரத் திட்டம்) - Smart LPG Gas Management System
-- Database Schema: MySQL 8.0+
-- Author: Bharat Digital Governance Initiative
-- ====================================================================

CREATE DATABASE IF NOT EXISTS bharat_gas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bharat_gas_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'admin') DEFAULT 'citizen',
    language ENUM('en', 'ta') DEFAULT 'en',
    state VARCHAR(60) DEFAULT 'Tamil Nadu',
    district VARCHAR(60) DEFAULT 'Chennai',
    fcm_token VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_mobile (mobile_number),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose ENUM('registration', 'login', 'connection_link', 'delivery_confirm', 'family_consent') NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    twilio_sid VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_mobile_purpose (mobile_number, purpose, is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Gas Providers Table
CREATE TABLE IF NOT EXISTS gas_providers (
    id VARCHAR(20) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    display_name_ta VARCHAR(100) NOT NULL,
    company_name VARCHAR(120) NOT NULL,
    logo_badge VARCHAR(50) NOT NULL,
    primary_color VARCHAR(20) NOT NULL,
    cylinder_price_14kg DECIMAL(10,2) DEFAULT 803.00,
    cylinder_price_5kg DECIMAL(10,2) DEFAULT 320.00,
    cylinder_price_19kg DECIMAL(10,2) DEFAULT 1750.00,
    subsidy_rate DECIMAL(10,2) DEFAULT 200.00,
    emergency_helpline VARCHAR(20) DEFAULT '1906',
    toll_free_helpline VARCHAR(30) DEFAULT '1800-233-3555',
    api_status ENUM('live', 'mock_sandbox', 'maintenance') DEFAULT 'mock_sandbox',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Consumer LPG Connections Table
CREATE TABLE IF NOT EXISTS consumer_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider_id VARCHAR(20) NOT NULL,
    consumer_number VARCHAR(40) NOT NULL,
    lpg_id_17digit VARCHAR(30) NULL,
    registered_mobile VARCHAR(15) NOT NULL,
    consumer_name VARCHAR(120) NOT NULL,
    relationship_type ENUM('self', 'father', 'mother', 'spouse', 'son', 'daughter', 'sibling', 'other') DEFAULT 'self',
    connection_status ENUM('active', 'inactive', 'pending_verification', 'suspended') DEFAULT 'active',
    cylinder_type ENUM('14.2kg', '5kg', '19kg') DEFAULT '14.2kg',
    distributor_code VARCHAR(30) DEFAULT 'DIST-TN-401',
    distributor_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    district VARCHAR(80) DEFAULT 'Chennai',
    pincode VARCHAR(10) DEFAULT '600001',
    subsidy_eligible BOOLEAN DEFAULT TRUE,
    bank_name VARCHAR(100) DEFAULT 'State Bank of India',
    masked_bank_acc VARCHAR(30) DEFAULT 'XXXX-XXXX-4819',
    ifsc_code VARCHAR(20) DEFAULT 'SBIN0001234',
    consent_status ENUM('not_required', 'pending', 'granted', 'revoked') DEFAULT 'not_required',
    consent_granted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES gas_providers(id),
    INDEX idx_conn_user (user_id),
    INDEX idx_conn_consumer (consumer_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Refill Bookings Table
CREATE TABLE IF NOT EXISTS refill_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    connection_id INT NOT NULL,
    user_id INT NOT NULL,
    provider_id VARCHAR(20) NOT NULL,
    cylinder_type VARCHAR(20) DEFAULT '14.2kg',
    booking_date DATETIME NOT NULL,
    estimated_delivery_date DATETIME NOT NULL,
    actual_delivery_date DATETIME NULL,
    booking_status ENUM('booking_pending', 'booking_confirmed', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'booking_confirmed',
    amount_payable DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('cod', 'online_upi', 'netbanking', 'wallet') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    delivery_person_name VARCHAR(100) NULL,
    delivery_person_phone VARCHAR(20) NULL,
    delivery_otp VARCHAR(6) NULL,
    cancellation_reason VARCHAR(255) NULL,
    subsidy_status ENUM('pending', 'credited', 'not_applicable') DEFAULT 'pending',
    subsidy_amount DECIMAL(10,2) DEFAULT 0.00,
    subsidy_utr_no VARCHAR(40) NULL,
    subsidy_credited_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES consumer_connections(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES gas_providers(id),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_ref (booking_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Family Members & Consent Management
CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(40) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email VARCHAR(120) NULL,
    provider_id VARCHAR(20) NOT NULL,
    consumer_number VARCHAR(40) NOT NULL,
    consent_status ENUM('pending', 'granted', 'rejected', 'revoked') DEFAULT 'pending',
    consent_token VARCHAR(100) UNIQUE NOT NULL,
    permissions JSON DEFAULT ('{"view_details": true, "view_history": true, "allow_booking": true}'),
    consent_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES gas_providers(id),
    INDEX idx_family_token (consent_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    title_ta VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    message_ta TEXT NOT NULL,
    notification_type ENUM('booking_status', 'refill_reminder', 'delivery_update', 'family_consent', 'subsidy_alert', 'general') NOT NULL,
    channel ENUM('in_app', 'sms', 'fcm', 'all') DEFAULT 'all',
    reference_id VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Citizen Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(40) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    category ENUM('gas_leak_emergency', 'delayed_delivery', 'subsidy_issue', 'kyc_verification', 'meter_cylinder_defect', 'general') NOT NULL,
    priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    description TEXT NOT NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
