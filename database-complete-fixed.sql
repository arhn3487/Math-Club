-- Math Club Database Schema - Complete & Fixed
-- PostgreSQL + Supabase Setup
-- Features: All tables, resource sharing with batch selection, user approval workflow
-- Includes batches from 2014 to current year

-- ==================== CREATE EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== DROP EXISTING TABLES (Run this first if needed) ====================
DROP TABLE IF EXISTS student_exam_responses CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS shared_resources CASCADE;
DROP TABLE IF EXISTS video_resources CASCADE;
DROP TABLE IF EXISTS resource_folders CASCADE;
DROP TABLE IF EXISTS class_recordings CASCADE;
DROP TABLE IF EXISTS signup_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS batches CASCADE;

-- ==================== BATCHES TABLE ====================
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL UNIQUE,
  student_id VARCHAR(100) UNIQUE,
  admin_id VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin', 'pending')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  batch_year INTEGER REFERENCES batches(batch_year),
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
CREATE TABLE signup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  batch_year INT REFERENCES batches(batch_year),
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

-- ==================== EXAMS TABLE ====================
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  exam_name VARCHAR(255) NOT NULL,
  description TEXT,
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EXAM QUESTIONS TABLE ====================
CREATE TABLE exam_questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  marks_per_question INTEGER NOT NULL,
  question_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== STUDENT EXAM RESPONSES TABLE ====================
CREATE TABLE student_exam_responses (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  selected_answer VARCHAR(1),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EXAM RESULTS TABLE ====================
CREATE TABLE exam_results (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_marks_obtained INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage DECIMAL(5, 2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, user_id)
);

-- ==================== CLASS RECORDINGS TABLE ====================
CREATE TABLE class_recordings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  batch_year INTEGER REFERENCES batches(batch_year),
  uploaded_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== RESOURCE FOLDERS TABLE ====================
CREATE TABLE resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== VIDEO RESOURCES TABLE (for YouTube videos and video links) ====================
CREATE TABLE video_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_url TEXT NOT NULL,
  folder_id INTEGER REFERENCES resource_folders(id) ON DELETE SET NULL,
  added_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== VIDEO RESOURCE BATCHES (Junction table for many-to-many relationship) ====================
CREATE TABLE video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);

-- ==================== SHARED RESOURCES TABLE (for non-video resources like PDFs, docs, etc.) ====================
CREATE TABLE shared_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL,
  resource_url TEXT NOT NULL,
  file_size INTEGER,
  folder_id INTEGER REFERENCES resource_folders(id) ON DELETE SET NULL,
  added_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== SHARED RESOURCE BATCHES (Junction table for many-to-many relationship) ====================
CREATE TABLE shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);

-- ==================== NOTICES TABLE ====================
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  notice_type VARCHAR(50) NOT NULL CHECK (notice_type IN ('event', 'announcement', 'general')),
  event_date DATE,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_admin_id ON users(admin_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_batch_year ON users(batch_year);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_approved ON users(is_approved);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_signup_requests_email ON signup_requests(email);
CREATE INDEX idx_signup_requests_status ON signup_requests(status);
CREATE INDEX idx_signup_requests_verification_token ON signup_requests(verification_token);
CREATE INDEX idx_signup_requests_created_at ON signup_requests(created_at);
CREATE INDEX idx_signup_requests_batch_year ON signup_requests(batch_year);

CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX idx_student_exam_responses_exam_id ON student_exam_responses(exam_id);
CREATE INDEX idx_student_exam_responses_user_id ON student_exam_responses(user_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);

CREATE INDEX idx_class_recordings_batch_year ON class_recordings(batch_year);
CREATE INDEX idx_class_recordings_uploaded_by ON class_recordings(uploaded_by);

CREATE INDEX idx_resource_folders_created_by ON resource_folders(created_by);
CREATE INDEX idx_video_resources_folder_id ON video_resources(folder_id);
CREATE INDEX idx_video_resources_added_by ON video_resources(added_by);
CREATE INDEX idx_video_resource_batches_batch_year ON video_resource_batches(batch_year);
CREATE INDEX idx_video_resource_batches_video_id ON video_resource_batches(video_resource_id);

CREATE INDEX idx_shared_resources_folder_id ON shared_resources(folder_id);
CREATE INDEX idx_shared_resources_added_by ON shared_resources(added_by);
CREATE INDEX idx_shared_resource_batches_batch_year ON shared_resource_batches(batch_year);
CREATE INDEX idx_shared_resource_batches_resource_id ON shared_resource_batches(shared_resource_id);

CREATE INDEX idx_notices_created_by ON notices(created_by);
CREATE INDEX idx_notices_created_at ON notices(created_at);

-- ==================== INSERT BATCHES (2014 to Current Year - 2026) ====================
INSERT INTO batches (batch_year, batch_name) VALUES
(2014, 'Batch 2014'),
(2015, 'Batch 2015'),
(2016, 'Batch 2016'),
(2017, 'Batch 2017'),
(2018, 'Batch 2018'),
(2019, 'Batch 2019'),
(2020, 'Batch 2020'),
(2021, 'Batch 2021'),
(2022, 'Batch 2022'),
(2023, 'Batch 2023'),
(2024, 'Batch 2024'),
(2025, 'Batch 2025'),
(2026, 'Batch 2026')
ON CONFLICT DO NOTHING;

-- ==================== INSERT DEMO DATA ====================
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

-- Demo Student Accounts (Approved)
INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, phone, batch_year, is_active, is_approved, email_verified)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222',
    'student_001',
    '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
    'student',
    'John Smith',
    'john@example.com',
    '+0987654321',
    2023,
    true,
    true,
    true
  )
ON CONFLICT (user_id) DO NOTHING;

-- ==================== USEFUL QUERIES ====================
-- View all users:
-- SELECT id, user_id, full_name, email, user_type, batch_year, is_active, is_approved FROM users ORDER BY created_at DESC;

-- View all batches:
-- SELECT * FROM batches ORDER BY batch_year;

-- View pending signup requests:
-- SELECT * FROM signup_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- Get all resources for a specific batch:
-- SELECT vr.id, vr.title, vr.description, vr.resource_url, vr.created_at
-- FROM video_resources vr
-- JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
-- WHERE vrb.batch_year = 2023 AND vr.is_active = true
-- ORDER BY vr.created_at DESC;

-- Get all shared resources for a specific batch:
-- SELECT sr.id, sr.title, sr.description, sr.resource_type, sr.resource_url, sr.created_at
-- FROM shared_resources sr
-- JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
-- WHERE srb.batch_year = 2023 AND sr.is_active = true
-- ORDER BY sr.created_at DESC;

-- Get resources accessible to a student (their batch + general resources):
-- SELECT vr.id, vr.title, vr.description, vr.resource_url, vr.created_at, 'video' as type
-- FROM video_resources vr
-- LEFT JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
-- WHERE vr.is_active = true AND (vrb.batch_year = 2023 OR vrb.batch_year IS NULL)
-- UNION
-- SELECT sr.id, sr.title, sr.description, sr.resource_url, sr.created_at, sr.resource_type
-- FROM shared_resources sr
-- LEFT JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
-- WHERE sr.is_active = true AND (srb.batch_year = 2023 OR srb.batch_year IS NULL);

-- Add a video resource to multiple batches:
-- INSERT INTO video_resource_batches (video_resource_id, batch_year) VALUES
-- (1, 2023), (1, 2024), (1, 2025);

-- Add a shared resource to multiple batches:
-- INSERT INTO shared_resource_batches (shared_resource_id, batch_year) VALUES
-- (1, 2023), (1, 2024), (1, 2025);

-- View resources uploaded by specific user:
-- SELECT id, title, resource_url, created_at FROM video_resources WHERE added_by = 'admin_001' AND is_active = true;

-- Delete a user:
-- DELETE FROM users WHERE user_id = 'student_001';

-- Update user status:
-- UPDATE users SET is_active = false WHERE user_id = 'student_001';

-- Approve a student:
-- UPDATE users SET is_approved = true, is_active = true WHERE id = 'user_id_here';
