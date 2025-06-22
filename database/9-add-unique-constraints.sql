-- Add unique constraints for proper upsert functionality
-- This migration ensures that certain records (like period flow and lifestyle data) 
-- are unique per user per day, preventing duplicate entries

-- STEP 1: Clean up duplicate data before adding constraints

-- Clean up duplicate lifestyle_entries - keep only the most recent record per user per day
WITH duplicates_to_delete AS (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, date 
             ORDER BY created_at DESC
           ) as row_num
    FROM lifestyle_entries
  ) ranked
  WHERE row_num > 1
)
DELETE FROM lifestyle_entries 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Clean up duplicate quick_records - keep only the most recent record per user per day per type
WITH duplicates_to_delete AS (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, date, record_type 
             ORDER BY created_at DESC
           ) as row_num
    FROM quick_records
  ) ranked
  WHERE row_num > 1
)
DELETE FROM quick_records 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- STEP 2: Add unique constraints after cleaning up duplicates

-- Add unique constraint for lifestyle_entries (user_id, date)
-- This ensures only one lifestyle entry per user per day
ALTER TABLE lifestyle_entries 
ADD CONSTRAINT lifestyle_entries_user_date_unique 
UNIQUE (user_id, date);

-- Add unique constraint for quick_records (user_id, date, record_type)
-- This ensures only one record of each type per user per day
-- For example: only one period_flow record per day
ALTER TABLE quick_records 
ADD CONSTRAINT quick_records_user_date_type_unique 
UNIQUE (user_id, date, record_type);

-- Note: water_intake table intentionally does not have unique constraint
-- because users can record multiple water intake entries per day 