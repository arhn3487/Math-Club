-- COMPLETE FIX: Keep EVERYTHING + Add Resource Sharing
-- NO DATA LOSS - All existing tables preserved and enhanced

-- ==================== CREATE BATCHES TABLE (if not exists) ====================
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE RESOURCE FOLDERS ====================
CREATE TABLE IF NOT EXISTS resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE RESOURCES TABLE (For any file type: PDF, Doc, etc.) ====================
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

-- ==================== CREATE RESOURCE BATCH ACCESS (For multiple batch visibility) ====================
CREATE TABLE IF NOT EXISTS resource_batch_access (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, batch_year)
);

-- ==================== CREATE VIDEO RESOURCES TABLE (For YouTube/video URLs) ====================
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

-- ==================== CREATE VIDEO RESOURCE BATCHES (Many-to-many for videos) ====================
CREATE TABLE IF NOT EXISTS video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);

-- ==================== CREATE SHARED RESOURCES TABLE (For PDFs, docs, etc.) ====================
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

-- ==================== CREATE SHARED RESOURCE BATCHES (Many-to-many for resources) ====================
CREATE TABLE IF NOT EXISTS shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);

-- ==================== CREATE INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_resource_folders_created_by ON resource_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_folder_id ON resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_resources_batch_year ON resources(batch_year);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resource_batch_access_batch_year ON resource_batch_access(batch_year);
CREATE INDEX IF NOT EXISTS idx_resource_batch_access_resource_id ON resource_batch_access(resource_id);

CREATE INDEX IF NOT EXISTS idx_video_resources_folder_id ON video_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_video_resources_added_by ON video_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_batch_year ON video_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_video_id ON video_resource_batches(video_resource_id);

CREATE INDEX IF NOT EXISTS idx_shared_resources_folder_id ON shared_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_shared_resources_added_by ON shared_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_batch_year ON shared_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_resource_id ON shared_resource_batches(shared_resource_id);

-- ==================== INSERT ALL BATCHES (2014 to 2026) ====================
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
-- 1. class_recordings table is UNCHANGED - your existing videos stay as they are
-- 2. New tables added for resource sharing:
--    - resources: For PDFs, documents, any file type
--    - video_resources: For YouTube/video URLs (separate from class_recordings)
--    - shared_resources: Alternative storage for resources
--    - resource_folders: Organize resources by folder
--    - Batch access tables: Control which batches see which resources
-- 3. All batches (2014-2026) created and ready to use
-- 4. Batch filtering: Each resource can be assigned to one or multiple batches
-- 5. Resources can be edited and deleted via API

-- ==================== VERIFY ====================
-- Your existing class_recordings are still there:
-- SELECT COUNT(*) FROM class_recordings;

-- New resource sharing tables:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('resources', 'video_resources', 'shared_resources', 'resource_folders')
-- ORDER BY table_name;
