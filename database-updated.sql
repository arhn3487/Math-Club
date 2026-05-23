-- Math Club Database Schema - Updated for Online Hosting
-- PostgreSQL + Supabase Setup
-- Features: Image storage, Email verification, Student approval workflow

-- ==================== CREATE EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin', 'pending')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(500),
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- ==================== SIGNUP REQUESTS TABLE ====================
CREATE TABLE IF NOT EXISTS signup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  batch_year INT,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_token VARCHAR(500) NOT NULL,
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  is_email_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comment TEXT
);

-- ==================== INDEXES ====================
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_approved ON users(is_approved);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_signup_requests_email ON signup_requests(email);
CREATE INDEX idx_signup_requests_status ON signup_requests(status);
CREATE INDEX idx_signup_requests_verification_token ON signup_requests(verification_token);
CREATE INDEX idx_signup_requests_created_at ON signup_requests(created_at);

-- ==================== DEMO DATA ====================
-- Demo Admin Account
INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, phone, is_active, is_approved, email_verified)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'admin_001',
    '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
    'admin',
    'Admin User',
    'admin@mathclub.com',
    '+1234567890',
    true,
    true,
    true
  )
ON CONFLICT (user_id) DO NOTHING;

-- Demo Student Account (Approved)
INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, phone, is_active, is_approved, email_verified)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222',
    'student_001',
    '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
    'student',
    'John Smith',
    'john@example.com',
    '+0987654321',
    true,
    true,
    true
  )
ON CONFLICT (user_id) DO NOTHING;

-- ==================== USEFUL QUERIES ====================
-- View all users:
-- SELECT id, user_id, full_name, email, user_type, is_active, is_approved FROM users;

-- View pending signup requests:
-- SELECT * FROM signup_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- View users pending email verification:
-- SELECT * FROM users WHERE email_verified = false AND created_at > NOW() - INTERVAL '7 days';

-- Delete a user:
-- DELETE FROM users WHERE user_id = 'student_001';

-- Update user status:
-- UPDATE users SET is_active = false WHERE user_id = 'student_001';

-- Approve a student:
-- UPDATE users SET is_approved = true, is_active = true WHERE id = 'student_id_here';

-- ==================== DROP LEGACY RESOURCE TABLES ====================
-- The project now uses `video_resources` and `shared_resources` for resource sharing.
-- Remove older/duplicated tables that are no longer needed. Run these if you
-- have already migrated any important data and are ready to delete legacy tables.

DROP TABLE IF EXISTS resource_batch_access CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
