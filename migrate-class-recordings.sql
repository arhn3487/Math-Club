-- MIGRATION SCRIPT: Move existing class_recordings to video_resources
-- This preserves your existing videos and makes them compatible with the new resource sharing system

-- Step 1: Migrate existing class_recordings to video_resources
INSERT INTO video_resources (title, description, resource_url, added_by, is_active, created_at, updated_at)
SELECT 
  title,
  description,
  youtube_url as resource_url,
  uploaded_by,
  is_active,
  created_at,
  updated_at
FROM class_recordings
WHERE id NOT IN (
  -- Avoid duplicates if this script is run multiple times
  SELECT id FROM video_resources WHERE id IN (SELECT id FROM class_recordings)
)
ON CONFLICT DO NOTHING;

-- Step 2: For recordings with batch_year set, create batch assignments
INSERT INTO video_resource_batches (video_resource_id, batch_year)
SELECT 
  vr.id,
  cr.batch_year
FROM video_resources vr
JOIN class_recordings cr ON vr.resource_url = cr.youtube_url AND vr.added_by = cr.uploaded_by
WHERE cr.batch_year IS NOT NULL
AND (vr.id, cr.batch_year) NOT IN (
  SELECT video_resource_id, batch_year FROM video_resource_batches
)
ON CONFLICT DO NOTHING;

-- Step 3: Verify migration
SELECT 
  'class_recordings' as source,
  COUNT(*) as total_count
FROM class_recordings

UNION

SELECT 
  'video_resources',
  COUNT(*)
FROM video_resources;
