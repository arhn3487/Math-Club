-- Math Club Database Migration Script
-- SAFE UPDATE: Adds missing tables without dropping existing data
-- Run this on your existing Supabase database to add resource sharing and batch features

-- ==================== CREATE BATCHES TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ADD BATCH_YEAR TO USERS TABLE (if not exists) ====================
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year INTEGER REFERENCES batches(batch_year);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- ==================== UPDATE USER TYPE CONSTRAINT ====================
-- Note: If user_type constraint exists, it needs to be updated to include 'pending'
-- This is a manual step if needed:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
-- ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('student', 'admin', 'pending'));

-- ==================== CREATE SIGNUP REQUESTS TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS signup_requests (
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

-- ==================== CREATE RESOURCE FOLDERS TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE VIDEO RESOURCES TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS video_resources (
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

-- ==================== CREATE VIDEO RESOURCE BATCHES TABLE (Junction table) ====================
CREATE TABLE IF NOT EXISTS video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);

-- ==================== CREATE SHARED RESOURCES TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS shared_resources (
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

-- ==================== CREATE SHARED RESOURCE BATCHES TABLE (Junction table) ====================
CREATE TABLE IF NOT EXISTS shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);

-- ==================== CREATE INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_signup_requests_email ON signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_verification_token ON signup_requests(verification_token);
CREATE INDEX IF NOT EXISTS idx_signup_requests_created_at ON signup_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_signup_requests_batch_year ON signup_requests(batch_year);

CREATE INDEX IF NOT EXISTS idx_users_batch_year ON users(batch_year);
CREATE INDEX IF NOT EXISTS idx_resource_folders_created_by ON resource_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_video_resources_folder_id ON video_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_video_resources_added_by ON video_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_batch_year ON video_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_video_id ON video_resource_batches(video_resource_id);

CREATE INDEX IF NOT EXISTS idx_shared_resources_folder_id ON shared_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_shared_resources_added_by ON shared_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_batch_year ON shared_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_resource_id ON shared_resource_batches(shared_resource_id);

-- ==================== INSERT BATCHES (2014 to 2026) ====================
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
ON CONFLICT (batch_year) DO NOTHING;

-- ==================== IMPORTANT NOTES ====================
-- 1. After running this migration, verify all tables were created successfully
-- 2. If constraint updates fail, run these manually in Supabase SQL editor:
--    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
--    ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('student', 'admin', 'pending'));
-- 3. The resource sharing feature now supports:
--    - Video resources with batch-level access control
--    - Shared resources (PDFs, docs, etc.) with batch-level access control
--    - Junction tables for many-to-many relationships between resources and batches
-- 4. All batches from 2014-2026 have been inserted
