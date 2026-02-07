-- ============================================================================
-- Simple Fixes - Alternative approach without generated columns
-- ============================================================================

-- FIX 1: Add event_date as a regular column (not generated)
-- Then we'll need to update the frontend or use a trigger to sync it
DO $$ 
BEGIN
  -- Drop the generated column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
      AND column_name = 'event_date'
      AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE events DROP COLUMN event_date;
  END IF;
  
  -- Add as regular column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE events ADD COLUMN event_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Copy start_date values to event_date for existing records
UPDATE events SET event_date = start_date WHERE event_date IS NULL;

-- Create trigger to keep event_date in sync with start_date
CREATE OR REPLACE FUNCTION sync_event_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.event_date := NEW.start_date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_event_date_trigger ON events;
CREATE TRIGGER sync_event_date_trigger 
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW 
  EXECUTE FUNCTION sync_event_date();

-- FIX 2: Verify and recreate projects foreign key
DO $$
BEGIN
  -- Drop existing constraint if it exists with wrong name
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'projects' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name != 'projects_project_lead_id_fkey'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE projects DROP CONSTRAINT ' || constraint_name || ';'
      FROM information_schema.table_constraints 
      WHERE table_name = 'projects' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name != 'projects_project_lead_id_fkey'
      LIMIT 1
    );
  END IF;
  
  -- Add the constraint with correct name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_project_lead_id_fkey'
  ) THEN
    ALTER TABLE projects 
    ADD CONSTRAINT projects_project_lead_id_fkey 
    FOREIGN KEY (project_lead_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- FIX 3: Verify opportunities foreign key to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'opportunities_category_id_fkey'
  ) THEN
    ALTER TABLE opportunities 
    ADD CONSTRAINT opportunities_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES opportunity_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- FIX 4: Verify ideas foreign key to categories  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ideas_category_id_fkey'
  ) THEN
    ALTER TABLE ideas 
    ADD CONSTRAINT ideas_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES idea_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- RELOAD POSTGREST SCHEMA CACHE
-- ============================================================================
-- This is critical! PostgREST caches the schema and needs to be notified of changes
-- Run this to reload the schema cache:

NOTIFY pgrst, 'reload schema';

-- Alternative: You can also reload from Supabase dashboard:
-- Settings > API > Reload schema cache

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify event_date column
SELECT 'event_date column' AS check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'event_date'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status;

-- Verify projects foreign key
SELECT 'projects_project_lead_id_fkey' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_project_lead_id_fkey'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status;

-- Verify opportunities foreign key
SELECT 'opportunities_category_id_fkey' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'opportunities_category_id_fkey'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status;

-- Verify ideas foreign key
SELECT 'ideas_category_id_fkey' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ideas_category_id_fkey'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status;
