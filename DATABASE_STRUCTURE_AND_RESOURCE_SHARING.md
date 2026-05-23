# Database Structure & Resource Sharing Implementation

## Overview
This document explains the complete database structure for the Math Club website, with a focus on the resource sharing feature that supports batch-level access control.

## Table of Contents
1. [Database Tables](#database-tables)
2. [Resource Sharing Architecture](#resource-sharing-architecture)
3. [Access Control](#access-control)
4. [Migration Steps](#migration-steps)
5. [API Usage](#api-usage)
6. [Query Examples](#query-examples)

---

## Database Tables

### Core Tables

#### `batches`
Stores all academic batches from 2014 to current year.

```sql
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  batch_year INTEGER NOT NULL UNIQUE,
  batch_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Data (2014-2026):**
- Batch 2014 through Batch 2026
- Each batch has a unique year identifier

---

#### `users`
Stores user information with batch assignment and approval workflow.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL UNIQUE,
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
```

**Key Fields:**
- `batch_year`: Links student to their batch (can be NULL for admins)
- `is_approved`: Whether admin has approved this user
- `email_verified`: Whether email has been verified

---

#### `signup_requests`
Temporary table for new user registration workflow.

```sql
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
```

---

### Exam Tables

#### `exams`
Stores exam information.

```sql
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
```

---

#### `exam_questions`
Stores questions for each exam.

```sql
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
```

---

#### `exam_results` & `student_exam_responses`
Stores exam results and student responses.

```sql
CREATE TABLE student_exam_responses (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  selected_answer VARCHAR(1),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
```

---

### Class Recordings Table

#### `class_recordings`
Stores YouTube class recording links (original feature).

```sql
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
```

---

### Resource Sharing Tables

#### `resource_folders`
Organizes resources into folders.

```sql
CREATE TABLE resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

#### `video_resources` & `video_resource_batches`
Stores video links (YouTube, Vimeo, etc.) with batch-level access control.

```sql
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

-- Junction table for many-to-many relationship
CREATE TABLE video_resource_batches (
  id SERIAL PRIMARY KEY,
  video_resource_id INTEGER NOT NULL REFERENCES video_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_resource_id, batch_year)
);
```

---

#### `shared_resources` & `shared_resource_batches`
Stores non-video resources (PDFs, documents, spreadsheets, etc.) with batch-level access.

```sql
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

-- Junction table for many-to-many relationship
CREATE TABLE shared_resource_batches (
  id SERIAL PRIMARY KEY,
  shared_resource_id INTEGER NOT NULL REFERENCES shared_resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shared_resource_id, batch_year)
);
```

---

#### `notices`
Stores announcements and notices.

```sql
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
```

---

## Resource Sharing Architecture

### Key Design Decisions

1. **Separate Tables for Different Resource Types**
   - `video_resources` for YouTube/video links
   - `shared_resources` for PDFs, documents, etc.
   - Allows optimized querying and type-specific metadata

2. **Junction Tables for Batch Selection**
   - `video_resource_batches` links videos to multiple batches
   - `shared_resource_batches` links resources to multiple batches
   - Supports many-to-many relationships
   - If a resource has no batch entries, it's visible to ALL batches

3. **Granular Access Control**
   - Each resource can be assigned to specific batches
   - Students only see resources for their batch (or universal resources)
   - Admins upload resources and select target batches

---

## Access Control

### Student Access Rules

A student in **Batch 2023** can see:
1. ✅ Resources assigned ONLY to Batch 2023
2. ✅ Resources assigned to multiple batches including 2023
3. ✅ Resources with NO batch assignment (universal resources)
4. ❌ Resources assigned only to Batch 2024, 2025, etc.

### Resource Visibility Logic

```
IF resource.batches.length == 0:
  visible to ALL batches (universal resource)
ELSE IF student.batch_year IN resource.batches:
  visible to student
ELSE:
  NOT visible to student
```

---

## Migration Steps

### Step 1: Run Migration Script
Execute `database-migration.sql` on your Supabase database:

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `database-migration.sql`
4. Click "Run"
5. Verify success message

### Step 2: Verify Tables Created

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should include:
- batches
- users (with new columns)
- signup_requests
- resource_folders
- video_resources
- video_resource_batches
- shared_resources
- shared_resource_batches
- exams, exam_questions, exam_results, etc.

### Step 3: Verify Batches Inserted

```sql
SELECT * FROM batches ORDER BY batch_year;
```

Should show all batches from 2014 to 2026.

### Step 4: Update API Route

Replace `/app/api/resource-sharing/route.ts` with updated code from `route-updated.ts`:

1. The new code properly joins with junction tables
2. Filters resources based on student's batch
3. Handles POST requests to upload resources with batch selection

---

## API Usage

### GET /api/resource-sharing

**Fetch all resources for logged-in user:**

```typescript
const response = await fetch('/api/resource-sharing', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { videos, resources } = await response.json()
```

**Request Parameters:**
- `type=video` - Get only video resources
- `type=resource` - Get only shared resources
- (no type parameter) - Get both

**Response:**
```json
{
  "videos": [
    {
      "id": 1,
      "title": "Advanced Calculus Part 1",
      "description": "...",
      "resource_url": "https://youtube.com/...",
      "added_by": "admin_001",
      "created_at": "2024-01-15T10:30:00Z",
      "resource_folders": { "folder_name": "Calculus" },
      "video_resource_batches": [
        { "batch_year": 2023 },
        { "batch_year": 2024 }
      ]
    }
  ],
  "resources": [
    {
      "id": 1,
      "title": "Calculus Solutions.pdf",
      "resource_type": "pdf",
      "resource_url": "https://storage.example.com/...",
      "file_size": 2048576,
      "shared_resource_batches": [
        { "batch_year": 2023 }
      ]
    }
  ]
}
```

### POST /api/resource-sharing

**Upload a new resource:**

```typescript
const response = await fetch('/api/resource-sharing', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Advanced Mathematics Lecture',
    description: 'Part 1 of the series',
    resource_url: 'https://youtube.com/watch?v=...',
    isVideo: true,
    batch_years: [2023, 2024, 2025],
    folder_id: 1
  })
})
```

**Upload a non-video resource:**

```typescript
const response = await fetch('/api/resource-sharing', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Calculus Textbook Chapter 5',
    description: 'Reference material',
    resource_type: 'pdf',
    resource_url: 'https://storage.example.com/calculus-ch5.pdf',
    file_size: 3145728,
    isVideo: false,
    batch_years: [2023, 2024],
    folder_id: 2
  })
})
```

---

## Query Examples

### Get All Resources for a Specific Batch

```sql
-- Video resources for Batch 2023
SELECT vr.id, vr.title, vr.description, vr.resource_url, vr.created_at
FROM video_resources vr
JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
WHERE vrb.batch_year = 2023 AND vr.is_active = true
ORDER BY vr.created_at DESC;

-- Shared resources for Batch 2023
SELECT sr.id, sr.title, sr.resource_type, sr.resource_url, sr.created_at
FROM shared_resources sr
JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
WHERE srb.batch_year = 2023 AND sr.is_active = true
ORDER BY sr.created_at DESC;
```

### Get Resources Accessible to a Student

```sql
-- For a student in Batch 2023
SELECT vr.id, vr.title, vr.resource_url, 'video' as type, vr.created_at
FROM video_resources vr
LEFT JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
WHERE vr.is_active = true 
  AND (vrb.batch_year = 2023 OR vrb.id IS NULL)
  
UNION

SELECT sr.id, sr.title, sr.resource_url, sr.resource_type, sr.created_at
FROM shared_resources sr
LEFT JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
WHERE sr.is_active = true 
  AND (srb.batch_year = 2023 OR srb.id IS NULL)

ORDER BY created_at DESC;
```

### Create a Resource and Assign to Multiple Batches

```sql
-- Step 1: Create the video resource
INSERT INTO video_resources (title, description, resource_url, added_by, is_active)
VALUES (
  'Linear Algebra Fundamentals',
  'Complete introduction to linear algebra',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'admin_001',
  true
)
RETURNING id;
-- This returns: 42

-- Step 2: Assign to multiple batches
INSERT INTO video_resource_batches (video_resource_id, batch_year) VALUES
(42, 2023),
(42, 2024),
(42, 2025);
```

### Get All Resources Uploaded by a User

```sql
-- Video resources uploaded by admin_001
SELECT id, title, resource_url, created_at 
FROM video_resources 
WHERE added_by = 'admin_001' AND is_active = true
ORDER BY created_at DESC;

-- Shared resources uploaded by admin_001
SELECT id, title, resource_type, resource_url, created_at 
FROM shared_resources 
WHERE added_by = 'admin_001' AND is_active = true
ORDER BY created_at DESC;
```

### Get Resources in a Folder

```sql
-- All active resources in "Calculus" folder
SELECT 
  vr.id, 
  vr.title, 
  vr.resource_url,
  'video' as type,
  vr.created_at
FROM video_resources vr
JOIN resource_folders rf ON vr.folder_id = rf.id
WHERE rf.folder_name = 'Calculus' AND vr.is_active = true

UNION

SELECT 
  sr.id, 
  sr.title, 
  sr.resource_url,
  sr.resource_type,
  sr.created_at
FROM shared_resources sr
JOIN resource_folders rf ON sr.folder_id = rf.id
WHERE rf.folder_name = 'Calculus' AND sr.is_active = true

ORDER BY created_at DESC;
```

### Deactivate a Resource

```sql
-- Deactivate a video resource
UPDATE video_resources 
SET is_active = false, updated_at = NOW() 
WHERE id = 42;

-- Deactivate a shared resource
UPDATE shared_resources 
SET is_active = false, updated_at = NOW() 
WHERE id = 15;
```

### Update Resource Batch Assignments

```sql
-- Change which batches can see resource 42
-- First, delete old assignments
DELETE FROM video_resource_batches WHERE video_resource_id = 42;

-- Then add new assignments
INSERT INTO video_resource_batches (video_resource_id, batch_year) VALUES
(42, 2024),
(42, 2025),
(42, 2026);
```

---

## Summary of Changes

### What Was Fixed

1. ✅ **Database Completeness**: Combined all tables from both database files
2. ✅ **Resource Sharing Tables**: Added `video_resources` and `shared_resources` tables
3. ✅ **Batch Support**: Added junction tables for many-to-many batch relationships
4. ✅ **All Batches**: Inserted all batches from 2014 to 2026
5. ✅ **Access Control**: Implemented proper batch-level resource filtering
6. ✅ **API Route**: Updated to query junction tables correctly

### Files to Use

1. **First-time setup**: Use `database-complete-fixed.sql`
2. **Migration on existing DB**: Use `database-migration.sql`
3. **Updated API**: Replace your route.ts with `route-updated.ts`

---

## Troubleshooting

### Resources Not Showing for Students

**Problem**: Students see no resources even when admins uploaded them.

**Solution**: 
1. Verify student's `batch_year` is set in users table
2. Check that resource is assigned to student's batch in junction table
3. Verify resource `is_active = true`

### Error: "Column does not exist"

**Problem**: API returns column not found error.

**Solution**:
1. Run migration script to create missing columns
2. Restart application server

### Admin Can't Upload Resources

**Problem**: Upload returns 403 Forbidden.

**Solution**:
1. Verify user `user_type = 'admin'` in users table
2. Check JWT token is still valid
3. Verify authorization header format: `Bearer {token}`

