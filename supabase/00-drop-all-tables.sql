-- ============================================================================
-- JKUAT Innovation and Entrepreneurship Club - Drop All Tables
-- File 0: Clean slate - drops all existing tables
-- ============================================================================
-- ⚠️ WARNING: This will delete ALL data in these tables!
-- Only run this if you want to start completely fresh
-- ============================================================================

-- First, disable RLS on all tables to avoid permission issues
ALTER TABLE IF EXISTS event_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS idea_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resource_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS executive_committee DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS club_patrons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS elections DISABLE ROW LEVEL SECURITY;

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop tables in reverse dependency order to avoid foreign key conflicts

-- Drop event-related tables
DROP TABLE IF EXISTS event_shares CASCADE;
DROP TABLE IF EXISTS event_likes CASCADE;
DROP TABLE IF EXISTS event_comments CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Drop idea-related tables
DROP TABLE IF EXISTS idea_votes CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;

-- Drop resource-related tables
DROP TABLE IF EXISTS resource_downloads CASCADE;
DROP TABLE IF EXISTS resource_reviews CASCADE;
DROP TABLE IF EXISTS resource_sdg_mapping CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- Drop opportunity-related tables
DROP TABLE IF EXISTS opportunity_bookmarks CASCADE;
DROP TABLE IF EXISTS opportunity_applications CASCADE;
DROP TABLE IF EXISTS opportunity_views CASCADE;
DROP TABLE IF EXISTS opportunity_notifications CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS opportunity_categories CASCADE;

-- Drop project-related tables
DROP TABLE IF EXISTS project_collaborations CASCADE;
DROP TABLE IF EXISTS project_submissions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop payment-related tables
DROP TABLE IF EXISTS payment_receipts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Drop financial tables
DROP TABLE IF EXISTS financial_audit_trail CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS donations_sponsorships CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS budget_line_items CASCADE;
DROP TABLE IF EXISTS annual_budgets CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;

-- Drop communication tables
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS communication_preferences CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS announcement_recipients CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS message_recipients CASCADE;
DROP TABLE IF EXISTS chat_group_members CASCADE;
DROP TABLE IF EXISTS chat_groups CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- Drop meeting/governance tables
DROP TABLE IF EXISTS election_results CASCADE;
DROP TABLE IF EXISTS election_votes CASCADE;
DROP TABLE IF EXISTS election_candidates CASCADE;
DROP TABLE IF EXISTS election_positions CASCADE;
DROP TABLE IF EXISTS elections CASCADE;
DROP TABLE IF EXISTS constitutional_documents CASCADE;
DROP TABLE IF EXISTS meeting_minutes CASCADE;
DROP TABLE IF EXISTS meeting_attendees CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS meeting_types CASCADE;

-- Drop support tables
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;

-- Drop CMS tables
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

-- Drop leadership tables
DROP TABLE IF EXISTS club_patrons CASCADE;
DROP TABLE IF EXISTS executive_committee CASCADE;

-- Drop notification tables
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop testimonial tables
DROP TABLE IF EXISTS testimonials CASCADE;

-- Drop activity logs
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Drop profile tables
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop user table (last because of foreign keys)
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining helper tables
DROP TABLE IF EXISTS sdg_goals CASCADE;
DROP TABLE IF EXISTS resource_categories CASCADE;
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS partnership_organizations CASCADE;
DROP TABLE IF EXISTS user_opportunity_preferences CASCADE;

-- Drop custom types if any
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All tables dropped successfully!';
  RAISE NOTICE '📝 You can now run the migration files to recreate the schema.';
END $$;
