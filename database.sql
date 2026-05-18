-- Math Club Database Schema
-- PostgreSQL Setup Script
-- Database Name: math_club
-- Run this script after creating the database

-- ==================== CREATE EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==================== DEMO DATA ====================
-- Password for both demo accounts: password123

INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, is_active)
VALUES 
  (
    'student_student_001_1000',
    'student_001',
    '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
    'student',
    'John Smith',
    'john@example.com',
    true
  ),
  (
    'admin_admin_001_1000',
    'admin_001',
    '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
    'admin',
    'Admin User',
    'admin@example.com',
    true
  )
ON CONFLICT (user_id) DO NOTHING;

-- ==================== USEFUL QUERIES ====================
-- View all users:
-- SELECT * FROM users;

-- Delete a user:
-- DELETE FROM users WHERE user_id = 'student_001';

-- Update user status:
-- UPDATE users SET is_active = false WHERE user_id = 'student_001';

-- Reset password (requires rehashing with bcrypt):
-- UPDATE users SET password_hash = 'NEW_HASH_HERE' WHERE user_id = 'student_001';
