-- Math Club Database Schema - Supabase Online
-- PostgreSQL Setup for Supabase
-- Includes: Exams, Class Recordings, Notices, Batches
-- IMPORTANT: Run DROP section first, then CREATE section

-- ==================== DROP EXISTING TABLES (Run this first) ====================
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS class_recordings CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS student_exam_responses CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==================== CREATE EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL UNIQUE,
  student_id VARCHAR(100) UNIQUE,
  admin_id VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  batch_year INTEGER,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== BATCHES TABLE ====================
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- ==================== RESOURCE SHARING (folders + resources) ====================
CREATE TABLE resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('video','link')),
  resource_url TEXT NOT NULL,
  folder_id INTEGER REFERENCES resource_folders(id) ON DELETE SET NULL,
  batch_year INTEGER REFERENCES batches(batch_year),
  added_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX idx_student_exam_responses_exam_id ON student_exam_responses(exam_id);
CREATE INDEX idx_student_exam_responses_user_id ON student_exam_responses(user_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX idx_class_recordings_batch_year ON class_recordings(batch_year);
CREATE INDEX idx_class_recordings_uploaded_by ON class_recordings(uploaded_by);
CREATE INDEX idx_resources_folder_id ON resources(folder_id);
CREATE INDEX idx_resources_added_by ON resources(added_by);
CREATE INDEX idx_notices_created_by ON notices(created_by);
CREATE INDEX idx_notices_created_at ON notices(created_at);

-- ==================== DEMO DATA ====================
-- NOTE: Demo accounts are disabled (unapproved) for security
-- Students and admins must create real accounts and be approved by admin
-- Credentials shown at startup are for reference only

-- Removed: Demo data now requires approval workflow

-- ==================== USEFUL QUERIES ====================
-- View all users:
-- SELECT user_id, full_name, email, user_type, batch_year, is_active FROM users ORDER BY created_at DESC;

-- View all active exams:
-- SELECT exam_name, total_marks, duration_minutes, is_active FROM exams ORDER BY created_at DESC;

-- View exam results for a student:
-- SELECT e.exam_name, er.total_marks_obtained, er.total_marks, er.percentage, er.completed_at
-- FROM exam_results er
-- JOIN exams e ON er.exam_id = e.id
-- WHERE er.user_id = 'student_001'
-- ORDER BY er.completed_at DESC;

-- Delete a user:
-- DELETE FROM users WHERE user_id = 'student_001';

-- Update user status:
-- UPDATE users SET is_active = false WHERE user_id = 'student_001';
