# 🎯 Implementation Checklist - Resource Sharing Feature

> Start here! Follow these steps in order to fix your resource sharing feature.

---

## ✅ PHASE 1: DATABASE MIGRATION (5 minutes)

### Step 1.1: Open Supabase Dashboard
- [ ] Go to https://supabase.com
- [ ] Login to your account
- [ ] Select your Math Club project
- [ ] Click "SQL Editor" in the left sidebar

### Step 1.2: Create New Query
- [ ] Click "New Query" button
- [ ] A blank SQL editor will appear

### Step 1.3: Copy Migration Script
- [ ] Open file: `d:\Math Club Website\database-migration.sql`
- [ ] Select ALL content (Ctrl+A)
- [ ] Copy (Ctrl+C)

### Step 1.4: Paste & Execute
- [ ] Click in the Supabase SQL editor
- [ ] Paste (Ctrl+V)
- [ ] Click "Run" button (or press Ctrl+Enter)
- [ ] 🕐 Wait 15-30 seconds for completion

### Step 1.5: Verify Success
- [ ] Should see: "Query executed successfully" message
- [ ] No error messages
- [ ] ✅ If you see errors, DON'T proceed - check troubleshooting section

### Step 1.6: Double-Check Batches
- [ ] Create new query in Supabase
- [ ] Copy this query:
```sql
SELECT COUNT(*) as batch_count FROM batches;
```
- [ ] Run it
- [ ] Should return: **13**
- [ ] ✅ All batches (2014-2026) now exist

---

## ✅ PHASE 2: UPDATE API ROUTE (2 minutes)

### Step 2.1: Backup Current Route
- [ ] Open: `app/api/resource-sharing/route.ts`
- [ ] Select ALL (Ctrl+A)
- [ ] Copy (Ctrl+C)
- [ ] Create new file: `app/api/resource-sharing/route.ts.backup`
- [ ] Paste (Ctrl+V)
- [ ] ✅ Backup saved

### Step 2.2: Replace with Updated Route
- [ ] Open: `app/api/resource-sharing/route.ts` (original file)
- [ ] Select ALL (Ctrl+A)
- [ ] Delete
- [ ] Open file: `d:\Math Club Website\route-updated.ts`
- [ ] Select ALL (Ctrl+A)
- [ ] Copy (Ctrl+C)
- [ ] Go back to `app/api/resource-sharing/route.ts`
- [ ] Paste (Ctrl+V)
- [ ] Save (Ctrl+S)
- [ ] ✅ Route updated

### Step 2.3: Restart Server
- [ ] Open terminal (make sure it's inside your project)
- [ ] Press `Ctrl+C` to stop current server
- [ ] Run: `npm run dev`
- [ ] Wait for: "ready - started server on http://localhost:3000"
- [ ] ✅ Server restarted

---

## ✅ PHASE 3: TEST RESOURCE SHARING (10 minutes)

### Step 3.1: Verify Tables Created
- [ ] Go to Supabase Dashboard
- [ ] Click "SQL Editor"
- [ ] Create new query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('video_resources', 'shared_resources', 
                   'video_resource_batches', 'shared_resource_batches')
ORDER BY table_name;
```
- [ ] Run query
- [ ] Should see 4 table names
- [ ] ✅ All tables exist

### Step 3.2: Test Video Upload
- [ ] In Supabase SQL Editor, create new query:
```sql
INSERT INTO video_resources (title, description, resource_url, added_by, is_active)
VALUES (
  'Test Video - Algebra Basics',
  'Testing resource sharing feature',
  'https://youtube.com/watch?v=test123',
  'admin_001',
  true
)
RETURNING id;
```
- [ ] Run query
- [ ] Note the ID returned (e.g., 1)
- [ ] ✅ Video created

### Step 3.3: Assign to Batches
- [ ] In Supabase SQL Editor, create new query:
```sql
INSERT INTO video_resource_batches (video_resource_id, batch_year) VALUES
(ID_HERE, 2023),
(ID_HERE, 2024);
```
- [ ] Replace `ID_HERE` with the ID from step 3.2
- [ ] Run query
- [ ] ✅ Assigned to batches

### Step 3.4: Test Shared Resource
- [ ] In Supabase SQL Editor, create new query:
```sql
INSERT INTO shared_resources (title, description, resource_type, resource_url, added_by, is_active)
VALUES (
  'Test PDF - Math Notes.pdf',
  'Testing shared resources',
  'pdf',
  'https://storage.example.com/math-notes.pdf',
  'admin_001',
  true
)
RETURNING id;
```
- [ ] Run query
- [ ] Note the ID returned
- [ ] ✅ Shared resource created

### Step 3.5: Assign Shared Resource to Batch
- [ ] In Supabase SQL Editor, create new query:
```sql
INSERT INTO shared_resource_batches (shared_resource_id, batch_year) VALUES
(ID_HERE, 2023);
```
- [ ] Replace `ID_HERE` with the ID from step 3.4
- [ ] Run query
- [ ] ✅ Assigned to batch 2023

### Step 3.6: Test API Endpoint
- [ ] Open your application: http://localhost:3000
- [ ] Login with a student account in batch 2023
- [ ] Navigate to resource sharing page
- [ ] You should see:
  - ✅ Test Video - Algebra Basics (assigned to 2023 & 2024)
  - ✅ Test PDF - Math Notes.pdf (assigned to 2023)
- [ ] ✅ Resources appear

### Step 3.7: Verify Batch Filtering
- [ ] Login with a student account in batch 2025
- [ ] Navigate to resource sharing page
- [ ] You should NOT see:
  - ❌ Test Video (only for 2023 & 2024)
  - ❌ Test PDF (only for 2023)
- [ ] ✅ Batch filtering works

### Step 3.8: Cleanup Test Data
- [ ] In Supabase SQL Editor, create new query:
```sql
DELETE FROM video_resource_batches WHERE video_resource_id IN (
  SELECT id FROM video_resources WHERE title LIKE 'Test%'
);
DELETE FROM shared_resource_batches WHERE shared_resource_id IN (
  SELECT id FROM shared_resources WHERE title LIKE 'Test%'
);
DELETE FROM video_resources WHERE title LIKE 'Test%';
DELETE FROM shared_resources WHERE title LIKE 'Test%';
```
- [ ] Run query
- [ ] ✅ Test data removed

---

## 🎉 COMPLETION CHECKLIST

### Database
- [ ] Batches table has all 13 batches (2014-2026)
- [ ] Users table has batch_year column
- [ ] video_resources table created
- [ ] shared_resources table created
- [ ] video_resource_batches table created
- [ ] shared_resource_batches table created

### API
- [ ] route-updated.ts copied to app/api/resource-sharing/route.ts
- [ ] Dev server restarted
- [ ] No TypeScript errors in terminal

### Testing
- [ ] Can upload video resources
- [ ] Can assign to multiple batches
- [ ] Can upload shared resources
- [ ] Can assign shared resources to batches
- [ ] Students see resources for their batch
- [ ] Students don't see resources for other batches
- [ ] Test data cleaned up

---

## ⚠️ TROUBLESHOOTING

### Problem: "Table does not exist" error

**Status**: 🔴 DATABASE INCOMPLETE

**Solution**:
1. Go back to Phase 1, Step 1.4
2. Open `database-migration.sql` again
3. Run the entire script again
4. Wait for success message

---

### Problem: "Column batch_year does not exist"

**Status**: 🔴 DATABASE INCOMPLETE

**Solution**:
1. In Supabase SQL Editor, run:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_year INTEGER REFERENCES batches(batch_year);
```
2. Wait for success
3. Go back to Phase 2

---

### Problem: API shows "Internal server error"

**Status**: 🔴 API NOT UPDATED

**Solution**:
1. Verify Phase 2, Step 2.2 was completed
2. Check that route.ts has proper imports
3. Check terminal for error messages
4. Restart server: Ctrl+C, then `npm run dev`

---

### Problem: Resources not showing for students

**Status**: 🟡 POSSIBLE BATCH ASSIGNMENT ISSUE

**Solution**:
1. Verify student has `batch_year` set:
```sql
SELECT user_id, batch_year FROM users WHERE user_id = 'student_001';
```
2. Verify resource is assigned to that batch:
```sql
SELECT * FROM video_resource_batches WHERE batch_year = 2023;
```
3. Verify resource is `is_active = true`:
```sql
SELECT id, is_active FROM video_resources WHERE id = 1;
```

---

### Problem: Batches table is empty

**Status**: 🔴 STEP 1.6 INSERT FAILED

**Solution**:
1. In Supabase SQL Editor, create new query:
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
2. Run the query
3. Verify: `SELECT COUNT(*) FROM batches;` should return 13

---

## 📚 Additional Resources

If you need more help:

1. **Quick commands**: See `CRITICAL_SQL_QUERIES.md`
2. **Full documentation**: See `DATABASE_STRUCTURE_AND_RESOURCE_SHARING.md`
3. **Step-by-step guide**: See `RESOURCE_SHARING_QUICK_GUIDE.md`
4. **Complete overview**: See `SOLUTION_SUMMARY.md`

---

## 🎯 Next Steps (After Implementation)

Once everything is working:

1. ✨ Update UI to show batch selector when uploading
2. ✨ Add folder management in admin panel
3. ✨ Add resource download counter
4. ✨ Add resource ratings/reviews
5. ✨ Add bulk batch assignment

---

## 📝 Notes

- ✅ This checklist covers the complete implementation
- ✅ Each phase takes roughly 2-5 minutes
- ✅ Total time: ~15-20 minutes
- ✅ No existing data will be lost
- ✅ You can re-run migration script if needed

---

**Last Updated**: May 19, 2026  
**Status**: Ready for Implementation  
**Difficulty**: Moderate (mostly copy-paste)

