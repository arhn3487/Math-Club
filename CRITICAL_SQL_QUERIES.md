# Critical SQL Queries for Resource Sharing Implementation

> These are the exact SQL commands needed to update your database with resource sharing functionality.

---

## ⚡ QUICK FIX (Copy & Paste)

### If You Just Need the Essential Tables Added

```sql
-- 1. CREATE BATCHES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADD BATCH COLUMN TO USERS
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year INTEGER REFERENCES batches(batch_year);

-- 3. CREATE VIDEO RESOURCES TABLE
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

-- 4. CREATE VIDEO RESOURCE BATCHES (Junction Table)
CREATE TABLE IF NOT EXISTS video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);

-- 5. CREATE SHARED RESOURCES TABLE
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

-- 6. CREATE SHARED RESOURCE BATCHES (Junction Table)
CREATE TABLE IF NOT EXISTS shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);

-- 7. INSERT ALL BATCHES (2014-2026)
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
```

---

## 📋 Step-by-Step Query Execution

### Query 1: Create Batches Table
**Purpose**: Store all batches from 2014-2026

```sql
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Status**: ✅ Safe to run multiple times

---

### Query 2: Update Users Table
**Purpose**: Link students to their batch

```sql
-- Add batch_year column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year INTEGER REFERENCES batches(batch_year);

-- Also add missing columns for user management
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
```

**Status**: ✅ Safe to run - only adds columns if missing

---

### Query 3: Create Resource Folders Table
**Purpose**: Organize resources into folders (optional but recommended)

```sql
CREATE TABLE IF NOT EXISTS resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Status**: ✅ Safe to run multiple times

---

### Query 4: Create Video Resources Table
**Purpose**: Store YouTube/video links with metadata

```sql
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
```

**What this table stores**:
- YouTube video links
- Vimeo, Dailymotion, etc. video URLs
- Title and description for each video
- Reference to who uploaded it
- Whether it's currently active

---

### Query 5: Create Video Resource Batches Table
**Purpose**: Link video resources to multiple batches (many-to-many relationship)

```sql
CREATE TABLE IF NOT EXISTS video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);
```

**How it works**:
- One video can be assigned to multiple batches
- One batch can have multiple videos
- UNIQUE constraint prevents duplicate assignments
- Example: Video ID 1 can be assigned to batches 2023, 2024, 2025

---

### Query 6: Create Shared Resources Table
**Purpose**: Store non-video resources (PDFs, documents, spreadsheets, etc.)

```sql
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
```

**What this table stores**:
- PDF textbooks
- Word documents
- Spreadsheets
- Presentation files
- Any non-video resource type

---

### Query 7: Create Shared Resource Batches Table
**Purpose**: Link shared resources to multiple batches (many-to-many relationship)

```sql
CREATE TABLE IF NOT EXISTS shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);
```

**How it works**:
- One shared resource can be assigned to multiple batches
- One batch can have multiple shared resources
- Example: PDF ID 5 can be visible to batches 2023, 2024

---

### Query 8: Insert All Batches (2014-2026)
**Purpose**: Populate the batches table with all academic years

```sql
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
```

**Important**: `ON CONFLICT (batch_year) DO NOTHING` means if a batch already exists, it won't cause an error

**Verify**: After running, execute this to check:
```sql
SELECT COUNT(*) as batch_count FROM batches;
-- Should return: 13
```

---

## 🔧 Create Indexes (Optional but Recommended)

**Purpose**: Speed up queries that filter by batch, resource type, etc.

```sql
-- Batch-related indexes
CREATE INDEX IF NOT EXISTS idx_users_batch_year ON users(batch_year);
CREATE INDEX IF NOT EXISTS idx_batches_year ON batches(batch_year);

-- Video resource indexes
CREATE INDEX IF NOT EXISTS idx_video_resources_added_by ON video_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_video_resources_folder_id ON video_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_batch_year ON video_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_video_resource_batches_video_id ON video_resource_batches(video_resource_id);

-- Shared resource indexes
CREATE INDEX IF NOT EXISTS idx_shared_resources_added_by ON shared_resources(added_by);
CREATE INDEX IF NOT EXISTS idx_shared_resources_folder_id ON shared_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_batch_year ON shared_resource_batches(batch_year);
CREATE INDEX IF NOT EXISTS idx_shared_resource_batches_resource_id ON shared_resource_batches(shared_resource_id);

-- Folder indexes
CREATE INDEX IF NOT EXISTS idx_resource_folders_created_by ON resource_folders(created_by);
```

---

## 📝 Verify Everything Works

### Verification Query 1: Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('batches', 'video_resources', 'shared_resources', 
                   'video_resource_batches', 'shared_resource_batches', 'resource_folders')
ORDER BY table_name;
```

**Expected output**: Should list all 6 tables

---

### Verification Query 2: Check All Batches Inserted
```sql
SELECT batch_year, batch_name 
FROM batches 
ORDER BY batch_year;
```

**Expected output**: 13 rows from 2014 to 2026

---

### Verification Query 3: Check Users Have Batch Column
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'batch_year';
```

**Expected output**: One row showing batch_year as INTEGER

---

## 🚀 Usage Examples After Setup

### Upload a Video Resource to Batches 2023 and 2024

```sql
-- Step 1: Insert the video
INSERT INTO video_resources (title, description, resource_url, added_by, is_active)
VALUES (
  'Advanced Calculus - Part 1',
  'Introduction to multivariable calculus',
  'https://youtube.com/watch?v=...',
  'admin_001',
  true
)
RETURNING id;
-- Returns: 1

-- Step 2: Assign to batches (replace 1 with actual ID from step 1)
INSERT INTO video_resource_batches (video_resource_id, batch_year)
VALUES
(1, 2023),
(1, 2024);
```

---

### Upload a Shared Resource (PDF) to Batch 2023 Only

```sql
-- Step 1: Insert the resource
INSERT INTO shared_resources (title, description, resource_type, resource_url, file_size, added_by, is_active)
VALUES (
  'Calculus Textbook - Chapter 5.pdf',
  'Reference material on vectors and derivatives',
  'pdf',
  'https://storage.example.com/calculus-ch5.pdf',
  3145728,
  'admin_001',
  true
)
RETURNING id;
-- Returns: 1

-- Step 2: Assign to batch (replace 1 with actual ID from step 1)
INSERT INTO shared_resource_batches (shared_resource_id, batch_year)
VALUES (1, 2023);
```

---

### Get All Resources a Student in Batch 2023 Can Access

```sql
-- Video resources
SELECT 
  id, 
  title, 
  resource_url, 
  'video' as type, 
  created_at
FROM video_resources vr
LEFT JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
WHERE vr.is_active = true 
  AND (vrb.batch_year = 2023 OR vrb.id IS NULL)

UNION

-- Shared resources
SELECT 
  id, 
  title, 
  resource_url, 
  resource_type, 
  created_at
FROM shared_resources sr
LEFT JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
WHERE sr.is_active = true 
  AND (srb.batch_year = 2023 OR srb.id IS NULL)

ORDER BY created_at DESC;
```

---

### Change Which Batches Can See a Resource

```sql
-- First, delete all old batch assignments for video ID 1
DELETE FROM video_resource_batches WHERE video_resource_id = 1;

-- Then add new batch assignments
INSERT INTO video_resource_batches (video_resource_id, batch_year)
VALUES (1, 2024), (1, 2025), (1, 2026);
```

---

## ❓ Common Issues & Fixes

### Issue: "video_resources table does not exist"

**Cause**: Query 4 wasn't executed

**Fix**: Re-run Query 4 (Create Video Resources Table)

---

### Issue: "batch_year does not exist on users"

**Cause**: Query 2 wasn't executed

**Fix**: Re-run Query 2 (Update Users Table)

---

### Issue: "constraint error when inserting batch"

**Cause**: Batch already exists

**Fix**: This is normal - the `ON CONFLICT DO NOTHING` in Query 8 handles this

---

### Issue: Resource appears for all batches unexpectedly

**Cause**: Resource has no entries in the junction table

**Fix**: This is actually correct behavior! Resources with no batch assignments are visible to ALL batches

**To restrict**: Insert entries in the junction table:
```sql
INSERT INTO video_resource_batches (video_resource_id, batch_year)
VALUES (1, 2023), (1, 2024);
```

---

## 📌 Summary of Files for You

| File | Purpose | When to Use |
|------|---------|-----------|
| database-complete-fixed.sql | Complete schema from scratch | New Supabase project |
| database-migration.sql | Add missing tables safely | Existing database |
| RESOURCE_SHARING_QUICK_GUIDE.md | Step-by-step implementation | Getting started |
| DATABASE_STRUCTURE_AND_RESOURCE_SHARING.md | Comprehensive documentation | Reference guide |
| route-updated.ts | Fixed API route | Replace existing route.ts |

