# Resource Sharing Feature - Quick Implementation Guide

## 🚀 What's Happening

Your resource sharing feature couldn't fetch data because:
1. ❌ Database was missing `video_resources` and `shared_resources` tables
2. ❌ No batch-to-resource relationships existed
3. ❌ API was looking for tables that weren't created
4. ❌ Not all batches (2014-current) were in the database

## ✅ What's Fixed

| Issue | Solution |
|-------|----------|
| Missing resource tables | Created `video_resources` and `shared_resources` tables |
| No batch selection | Added `video_resource_batches` and `shared_resource_batches` junction tables |
| Can't fetch data | Updated API to properly query new tables |
| Missing batches | Inserted all batches from 2014 to 2026 |
| No access control | Resources now visible only to selected batches (or all if no selection) |

---

## 📋 Files Created/Updated

### 1. **database-complete-fixed.sql**
Complete database schema with all tables (for new setup)

**Use when**: Starting fresh with new Supabase project

**Run**: 
- Open Supabase SQL Editor
- Copy entire file content
- Execute

---

### 2. **database-migration.sql** ⭐ MOST IMPORTANT
Safe update script to add missing tables (for existing database)

**Use when**: You have existing data and want to add resource sharing

**Run**:
```
1. Open Supabase SQL Editor
2. Copy entire file content
3. Execute
4. Wait for success message (15-30 seconds)
```

**What it does**:
- ✅ Creates new tables WITHOUT dropping existing data
- ✅ Adds missing columns to users table
- ✅ Creates resource and batch relationship tables
- ✅ Inserts all batches (2014-2026)
- ✅ Creates all necessary indexes

---

### 3. **DATABASE_STRUCTURE_AND_RESOURCE_SHARING.md**
Complete documentation with:
- All table schemas
- Query examples
- API usage
- Troubleshooting

---

### 4. **route-updated.ts**
Fixed API route with proper batch filtering

**Use when**: Ready to enable resource sharing in UI

**Steps**:
```
1. Copy route-updated.ts content
2. Replace app/api/resource-sharing/route.ts
3. Restart your application
```

---

## 🎯 Step-by-Step Implementation

### Phase 1: Update Database (5 minutes)

**Step 1.1: Open Supabase SQL Editor**
```
1. Go to supabase.com
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
```

**Step 1.2: Execute Migration Script**
```
1. Open database-migration.sql
2. Copy ALL content
3. Paste into SQL Editor
4. Click "Run"
5. Wait for "Query executed successfully" message
```

**Step 1.3: Verify Setup**
```sql
-- Run this query to verify batches were created:
SELECT COUNT(*) as batch_count FROM batches;
-- Should return: 13 (batches 2014-2026)

-- Run this to verify tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%resource%'
ORDER BY table_name;
-- Should return: resource_folders, shared_resource_batches, shared_resources, 
--               video_resource_batches, video_resources
```

---

### Phase 2: Update API (2 minutes)

**Step 2.1: Update Resource Sharing Route**
```
1. Open app/api/resource-sharing/route.ts in VS Code
2. Replace entire contents with route-updated.ts content
3. Save file (Ctrl+S)
```

**Step 2.2: Restart Dev Server**
```
1. In terminal running dev server, press Ctrl+C
2. Run: npm run dev
3. Wait for "ready - started server on..."
```

---

### Phase 3: Test Resource Sharing (10 minutes)

**Step 3.1: Upload a Resource**

Create this test script in your project root:

```typescript
// test-resource-upload.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testUploadResource() {
  try {
    // Create video resource
    const { data: videoResource, error: videoError } = await supabase
      .from('video_resources')
      .insert([
        {
          title: 'Test Video - Calculus Basics',
          description: 'Testing resource sharing feature',
          resource_url: 'https://youtube.com/watch?v=example',
          added_by: 'admin_001',
          is_active: true,
        }
      ])
      .select()
      .single()

    if (videoError) throw videoError
    console.log('✅ Video resource created:', videoResource.id)

    // Assign to Batch 2023 and 2024
    const { error: batchError } = await supabase
      .from('video_resource_batches')
      .insert([
        { video_resource_id: videoResource.id, batch_year: 2023 },
        { video_resource_id: videoResource.id, batch_year: 2024 },
      ])

    if (batchError) throw batchError
    console.log('✅ Assigned to batches 2023 and 2024')

    // Create shared resource
    const { data: sharedResource, error: sharedError } = await supabase
      .from('shared_resources')
      .insert([
        {
          title: 'Calculus Textbook Chapter 5.pdf',
          description: 'Reference material for vectors',
          resource_type: 'pdf',
          resource_url: 'https://storage.example.com/calc-ch5.pdf',
          file_size: 2048576,
          added_by: 'admin_001',
          is_active: true,
        }
      ])
      .select()
      .single()

    if (sharedError) throw sharedError
    console.log('✅ Shared resource created:', sharedResource.id)

    // Assign to Batch 2023 only
    const { error: sharedBatchError } = await supabase
      .from('shared_resource_batches')
      .insert([
        { shared_resource_id: sharedResource.id, batch_year: 2023 },
      ])

    if (sharedBatchError) throw sharedBatchError
    console.log('✅ Assigned shared resource to batch 2023')

    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testUploadResource()
```

Run it:
```bash
npx ts-node test-resource-upload.ts
```

**Step 3.2: Verify Resources Are Created**

In Supabase SQL Editor, run:
```sql
SELECT 'video_resources' as table_name, COUNT(*) as count FROM video_resources
UNION
SELECT 'shared_resources', COUNT(*) FROM shared_resources
UNION
SELECT 'video_resource_batches', COUNT(*) FROM video_resource_batches
UNION
SELECT 'shared_resource_batches', COUNT(*) FROM shared_resource_batches;
```

**Expected output:**
```
table_name                  count
video_resources             1
shared_resources            1
video_resource_batches      2
shared_resource_batches     1
```

---

## 🔍 Database Structure Summary

### Resource Sharing Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Resources                         │
└─────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│ video_resources      │      │ shared_resources     │
│                      │      │                      │
│ - id (PK)           │      │ - id (PK)           │
│ - title             │      │ - title             │
│ - resource_url      │      │ - resource_type     │
│ - added_by (FK)     │      │ - resource_url      │
│ - folder_id (FK)    │      │ - file_size         │
│ - is_active         │      │ - added_by (FK)     │
│ - created_at        │      │ - folder_id (FK)    │
└──────────────────────┘      │ - is_active         │
          │                   │ - created_at        │
          │                   └──────────────────────┘
          │                              │
    [Junction Table]               [Junction Table]
          │                              │
          ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│ video_resource_      │      │ shared_resource_     │
│ batches              │      │ batches              │
│                      │      │                      │
│ - id (PK)           │      │ - id (PK)           │
│ - video_resource_id │      │ - shared_resource_id │
│ (FK)                │      │ (FK)                 │
│ - batch_year (FK)   │      │ - batch_year (FK)   │
└──────────────────────┘      └──────────────────────┘
          │                              │
          └──────────┬───────────────────┘
                     ▼
          ┌──────────────────────┐
          │ batches              │
          │                      │
          │ - batch_year (PK)    │
          │ - batch_name         │
          │ - created_at         │
          └──────────────────────┘
```

### How Resources are Filtered for Students

```
Student in Batch 2023 requests resources:

1. Query video_resources:
   - Join with video_resource_batches
   - Filter: batch_year = 2023 OR no batch assignments

2. Query shared_resources:
   - Join with shared_resource_batches
   - Filter: batch_year = 2023 OR no batch assignments

3. Return only matching resources
```

---

## 📊 All Batches (2014-2026)

| Year | Available | Description |
|------|-----------|-------------|
| 2014 | ✅ | Batch 2014 |
| 2015 | ✅ | Batch 2015 |
| 2016 | ✅ | Batch 2016 |
| 2017 | ✅ | Batch 2017 |
| 2018 | ✅ | Batch 2018 |
| 2019 | ✅ | Batch 2019 |
| 2020 | ✅ | Batch 2020 |
| 2021 | ✅ | Batch 2021 |
| 2022 | ✅ | Batch 2022 |
| 2023 | ✅ | Batch 2023 |
| 2024 | ✅ | Batch 2024 |
| 2025 | ✅ | Batch 2025 |
| 2026 | ✅ | Batch 2026 |

---

## 🛠️ Troubleshooting

### Problem: "Table does not exist" error

**Solution**: Run database-migration.sql again
```
1. Open Supabase SQL Editor
2. Click "New Query"
3. Copy database-migration.sql content
4. Execute
```

---

### Problem: Resources not showing for students

**Solution**: Check batch assignments
```sql
-- Verify student has batch_year set:
SELECT user_id, batch_year FROM users WHERE user_id = 'student_001';

-- Verify resource is assigned to that batch:
SELECT * FROM video_resource_batches 
WHERE batch_year = 2023 AND video_resource_id = 1;
```

---

### Problem: "Unauthorized" error when uploading

**Solution**: Verify admin user
```sql
-- Check user is admin and approved:
SELECT user_id, user_type, is_approved FROM users 
WHERE user_id = 'admin_001';
-- Should show: admin_001 | admin | true
```

---

## 📝 Key Queries You'll Use

### Get Resources for a Batch
```sql
-- All resources accessible to Batch 2023
SELECT vr.id, vr.title, vr.resource_url, 'video' as type
FROM video_resources vr
LEFT JOIN video_resource_batches vrb ON vr.id = vrb.video_resource_id
WHERE vr.is_active = true AND (vrb.batch_year = 2023 OR vrb.id IS NULL)

UNION

SELECT sr.id, sr.title, sr.resource_url, sr.resource_type
FROM shared_resources sr
LEFT JOIN shared_resource_batches srb ON sr.id = srb.shared_resource_id
WHERE sr.is_active = true AND (srb.batch_year = 2023 OR srb.id IS NULL);
```

### Assign Resource to Batch
```sql
-- Assign video 1 to batches 2023, 2024, 2025
INSERT INTO video_resource_batches (video_resource_id, batch_year) VALUES
(1, 2023), (1, 2024), (1, 2025);
```

### Deactivate a Resource
```sql
UPDATE video_resources SET is_active = false WHERE id = 1;
UPDATE shared_resources SET is_active = false WHERE id = 1;
```

---

## ✨ Next Steps

After implementation:

1. ✅ Update UI to show batch selector when uploading resources
2. ✅ Add folder management feature
3. ✅ Add resource download tracking
4. ✅ Add resource comments/reviews
5. ✅ Add bulk batch assignment

---

## 📞 Support

If you encounter issues:

1. Check DATABASE_STRUCTURE_AND_RESOURCE_SHARING.md for detailed documentation
2. Run the troubleshooting queries above
3. Verify all 4 steps were completed in order

