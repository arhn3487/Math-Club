# ✅ CORRECT SOLUTION: Resource Sharing (NO Removal of Existing Features)

## What You Asked For (What I Should Have Done)

```
✅ Keep class_recordings table (YouTube videos) - UNCHANGED
✅ Add resources table (PDFs, docs, files) - NEW
✅ Resources organized in folders - NEW
✅ Resources can be edited - NEW
✅ Batch-level access for both - NEW
✅ Support all batches 2014-current - NEW
```

---

## Database Structure (Correct)

### 1. class_recordings (Your Existing Videos - UNCHANGED)
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
**Your existing videos stay here - COMPLETELY UNCHANGED**

---

### 2. resource_folders (NEW - Organize Resources)
```sql
CREATE TABLE resource_folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
**Example folders:**
- Mathematics Textbooks
- Practice Problems
- Assignment Solutions
- Reference Materials

---

### 3. resources (NEW - File Resources)
```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,           -- 'pdf', 'docx', 'xlsx', etc.
  file_size INTEGER,                        -- Size in bytes
  folder_id INTEGER REFERENCES resource_folders(id),
  batch_year INTEGER REFERENCES batches(batch_year),
  uploaded_by VARCHAR(50) NOT NULL REFERENCES users(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
**Stores:**
- PDFs
- Word documents (.docx)
- Spreadsheets (.xlsx)
- Text files
- Any file type

---

### 4. resource_batch_access (NEW - Batch Visibility)
```sql
CREATE TABLE resource_batch_access (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  batch_year INTEGER NOT NULL REFERENCES batches(batch_year) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, batch_year)
);
```
**How it works:**
- One resource can be visible to multiple batches
- If a resource has NO entries here = visible to ALL batches
- If resource has entries = visible ONLY to those batches

---

## How Data Flows

```
ADMIN UPLOADS VIDEO (YouTube)
     ↓
Stored in: class_recordings table
     ↓
Visible to: batch_year selected

ADMIN UPLOADS FILE (PDF, Doc, etc.)
     ↓
Stored in: resources table
     ↓
Organized in: resource_folders
     ↓
Visible to: batches in resource_batch_access table

STUDENT REQUESTS RESOURCES
     ↓
API queries BOTH tables:
  - class_recordings (videos)
  - resources (files)
     ↓
Filters by student's batch_year
     ↓
Returns authorized resources
```

---

## Database Tables Summary

| Table | Purpose | Contents |
|-------|---------|----------|
| `batches` | All batches 2014-2026 | Years and names |
| `class_recordings` | YouTube videos (UNCHANGED) | Your existing videos |
| `resource_folders` | Organize resources | Folder names and descriptions |
| `resources` | Non-video files | PDFs, docs, spreadsheets, etc. |
| `resource_batch_access` | Batch visibility | Which batches see which resources |
| `users` | User info | Logins, emails, batch assignments |

---

## Implementation Steps

### Step 1: Run Migration
```
1. Go to Supabase SQL Editor
2. Create new query
3. Copy file: database-migration-correct.sql
4. Paste into SQL Editor
5. Click "Run"
6. Wait for success ✅
```

**What it does:**
- ✅ Creates resource_folders table
- ✅ Creates resources table
- ✅ Creates resource_batch_access table
- ✅ Leaves class_recordings UNTOUCHED
- ✅ Your videos stay exactly as they are

---

### Step 2: Update API Route
```
1. Open: app/api/resource-sharing/route.ts
2. Replace with: route-correct.ts content
3. Save and restart server
```

**What it does:**
- ✅ Queries class_recordings for videos
- ✅ Queries resources for files
- ✅ Filters both by student's batch
- ✅ Supports GET, POST, PUT, DELETE
- ✅ Handles editing and deleting resources

---

## API Operations

### GET /api/resource-sharing
**Fetch all resources and videos**
```typescript
GET /api/resource-sharing

Response:
{
  "videos": [
    {
      "id": 1,
      "title": "Your existing video",
      "youtube_url": "https://youtube.com/...",
      "batch_year": null,  // Visible to all
      ...
    }
  ],
  "resources": [
    {
      "id": 1,
      "title": "Calculus Textbook",
      "file_url": "https://storage/book.pdf",
      "file_type": "pdf",
      "resource_folders": { "folder_name": "Textbooks" },
      "batch_year": 2023,
      ...
    }
  ]
}
```

**With filters:**
```
GET /api/resource-sharing?type=video    -- Only videos
GET /api/resource-sharing?type=resource -- Only resources
```

---

### POST /api/resource-sharing
**Upload new resource**
```typescript
POST /api/resource-sharing

Body:
{
  "title": "Advanced Calculus Solutions",
  "description": "Complete solutions manual",
  "file_name": "calculus_solutions.pdf",
  "file_url": "https://storage.example.com/...",
  "file_type": "pdf",
  "file_size": 2048576,
  "folder_id": 1,              // Put in folder
  "batch_year": 2023,          // Visible to this batch
  "batch_years": [2023, 2024]  // OR multiple batches
}

Response: 201 Created
{
  "message": "Resource created successfully",
  "data": { ... }
}
```

---

### PUT /api/resource-sharing
**Edit existing resource**
```typescript
PUT /api/resource-sharing

Body:
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "file_name": "updated_file.pdf",
  "folder_id": 2,
  "batch_years": [2024, 2025]  // Change which batches see it
}

Response: 200 OK
{
  "message": "Resource updated successfully",
  "data": { ... }
}
```

---

### DELETE /api/resource-sharing
**Delete resource (soft delete)**
```typescript
DELETE /api/resource-sharing

Body:
{
  "id": 1
}

Response: 200 OK
{
  "message": "Resource deleted successfully"
}
```

---

## Batch Access Control

### Single Batch (Simple)
```sql
-- Resource visible only to Batch 2023
INSERT INTO resources (title, ..., batch_year, ...) 
VALUES ('Math Book', ..., 2023, ...);
```

### Multiple Batches (Advanced)
```sql
-- Resource visible to Batches 2023, 2024, 2025
INSERT INTO resources (title, ..., batch_year, ...) 
VALUES ('Math Book', ..., null, ...);

INSERT INTO resource_batch_access (resource_id, batch_year) VALUES
(1, 2023), (1, 2024), (1, 2025);
```

### All Batches (Universal)
```sql
-- Resource visible to all batches
INSERT INTO resources (title, ..., batch_year, ...) 
VALUES ('Math Book', ..., null, ...);

-- Don't add any entries to resource_batch_access
```

---

## Folder Management

### Create Folder
```sql
INSERT INTO resource_folders (folder_name, description, created_by)
VALUES ('Calculus Textbooks', 'All calculus reference materials', 'admin_001');
```

### Add Resource to Folder
```sql
INSERT INTO resources (title, file_url, ..., folder_id, ...)
VALUES ('Calculus Ch5', 'https://...', ..., 1, ...);
-- Folder ID 1 = the folder created above
```

### View Resources in Folder
```sql
SELECT r.* 
FROM resources r
JOIN resource_folders f ON r.folder_id = f.id
WHERE f.folder_name = 'Calculus Textbooks'
AND r.is_active = true;
```

---

## Your Existing Data

**Your existing video:**
```
Table: class_recordings (UNCHANGED)
ID: 1
Title: "Nothing"
YouTube URL: https://www.youtube.com/watch?v=tSVGmZCbKs8...
Batch: null (visible to all)
Status: Active ✅
```

This video will continue to work perfectly!

---

## Verification Queries

### Check Video is Still There
```sql
SELECT id, title, youtube_url FROM class_recordings WHERE id = 1;
-- Should return your video
```

### Create Test Resource
```sql
INSERT INTO resources (title, file_name, file_url, file_type, uploaded_by, batch_year)
VALUES (
  'Test PDF',
  'test.pdf',
  'https://storage.example.com/test.pdf',
  'pdf',
  'ADM-1779171057623-2B40',
  2023
);
```

### Check Resource Created
```sql
SELECT id, title, file_url FROM resources WHERE title = 'Test PDF';
```

---

## Summary: What You Get

✅ **class_recordings table** - Your YouTube videos, UNCHANGED  
✅ **resources table** - New files (PDFs, docs, etc.)  
✅ **resource_folders table** - Organize resources  
✅ **Batch filtering** - Both videos and resources filtered by batch  
✅ **Editing** - Can edit/delete resources  
✅ **All batches 2014-2026** - Full range supported  

**Nothing is removed. Only new features added!**

