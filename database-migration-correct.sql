-- CORRECTED MIGRATION: Add Resource Sharing WITHOUT removing class_recordings
-- Keep class_recordings table completely unchanged
-- Add only: resource sharing tables for non-YouTube files

-- ==================== CREATE RESOURCE FOLDERS TABLE ====================
CREATE TABLE IF NOT EXISTS resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE RESOURCES TABLE (Non-video files) ====================
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  folder_id INTEGER REFERENCES resource_folders(id) ON DELETE SET NULL,
  batch_year INTEGER REFERENCES batches(batch_year),
  uploaded_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE RESOURCE BATCH ACCESS TABLE ====================
-- For resources that need access from multiple batches
CREATE TABLE IF NOT EXISTS resource_batch_access (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, batch_year)
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_resource_folders_created_by ON resource_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_resource_folders_is_active ON resource_folders(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_folder_id ON resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_resources_batch_year ON resources(batch_year);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resource_batch_access_batch_year ON resource_batch_access(batch_year);
CREATE INDEX IF NOT EXISTS idx_resource_batch_access_resource_id ON resource_batch_access(resource_id);

-- ==================== VERIFY TABLES ====================
-- class_recordings table is UNTOUCHED - still contains all your videos
-- Run this to verify:
-- SELECT COUNT(*) as video_count FROM class_recordings;
-- SELECT COUNT(*) as resource_count FROM resources;
