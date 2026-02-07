# Database Schema Fixes

## Issues Identified and Fixed

### 1. Events Table - Missing `event_date` Column
**Error:** `column events.event_date does not exist`

**Root Cause:** The events table uses `start_date` but frontend code queries `event_date`

**Fix:** Added `event_date` as a generated column that aliases `start_date` for backward compatibility

**Files Affected:**
- `routes/events.js` - queries `event_date`
- `supabase/02-events-system.sql` - defines table with `start_date`

---

### 2. Projects Table - Missing Foreign Key Constraint
**Error:** `Could not find a relationship between 'projects' and 'users' using the hint 'projects_project_lead_id_fkey'`

**Root Cause:** Projects table either doesn't exist or the foreign key constraint doesn't have the expected name

**Fix:** 
- Created complete `projects` table schema
- Added foreign key constraint with exact name: `projects_project_lead_id_fkey`

**Files Affected:**
- `routes/projects.js` - expects the named foreign key relationship

---

### 3. Opportunities and Categories - Missing Tables/Relationship
**Error:** `Could not find a relationship between 'opportunities' and 'opportunity_categories'`

**Root Cause:** Missing `opportunities` and `opportunity_categories` tables

**Fix:**
- Created `opportunity_categories` table with proper structure
- Created `opportunities` table with `category_id` foreign key
- Created supporting tables: `opportunity_applications`, `opportunity_bookmarks`
- Added seed data for default categories

**Files Affected:**
- `routes/opportunities.js` - queries both tables with relationship

---

### 4. Ideas Table - Missing Category Relationship
**Error:** `Could not find a relationship between 'ideas' and 'category_id'`

**Root Cause:** Missing `ideas` and `idea_categories` tables

**Fix:**
- Created `idea_categories` table
- Created `ideas` table with `category_id` foreign key
- Created supporting tables: `idea_votes`, `idea_comments`
- Added seed data for default categories

---

## How to Apply Fixes

### Option 1: Run the Complete Fix Script (Recommended)
```sql
-- Run this in Supabase SQL Editor
-- File: supabase/07-fix-schema-issues.sql
```

This script:
- ✅ Checks if tables/columns exist before creating
- ✅ Uses `DO $$ ... END $$` blocks for conditional logic
- ✅ Won't break if tables already exist
- ✅ Adds all missing indexes and triggers
- ✅ Includes seed data for categories

### Option 2: Run Individual Fixes
If you only need specific fixes, you can extract the relevant sections from the script.

---

## Verification

After running the fix script, verify with these queries:

```sql
-- 1. Check events.event_date exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'event_date';

-- 2. Check projects foreign key
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'projects' 
  AND constraint_name = 'projects_project_lead_id_fkey';

-- 3. Check opportunities tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('opportunities', 'opportunity_categories');

-- 4. Check ideas tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('ideas', 'idea_categories');
```

---

## Schema Overview

### Projects Table
- Tracks innovation projects, hackathons, and incubation programs
- Links to users via `project_lead_id`
- Supports team collaboration, milestones, and progress tracking

### Opportunities Table
- Internships, jobs, competitions, scholarships, grants, mentorships
- Categorized via `opportunity_categories`
- Supports applications and bookmarks

### Ideas Table
- Innovation ideas submitted by members
- Categorized via `idea_categories`
- Supports voting, comments, and team collaboration

---

## Next Steps

1. **Run the fix script** in Supabase SQL Editor
2. **Test the frontend** - all errors should be resolved
3. **Verify data** - check that seed categories were created
4. **Monitor logs** - ensure no new errors appear

---

## Notes

- All tables use UUID primary keys
- Timestamps are automatically managed via triggers
- Foreign keys use `ON DELETE SET NULL` or `CASCADE` appropriately
- Indexes are created for common query patterns
- All tables support soft features like tags, media, and engagement metrics
