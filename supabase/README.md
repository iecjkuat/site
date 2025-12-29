# JKUAT Innovation and Entrepreneurship Club - Supabase Setup

This folder contains SQL files to set up your Supabase database for the JKUAT Innovation and Entrepreneurship Club website.

## Files Overview

1. **01-create-tables.sql** - Creates all database tables with proper constraints and indexes
2. **02-create-functions.sql** - Creates database functions and triggers for automation
3. **03-enable-rls.sql** - Enables Row Level Security (RLS) and creates security policies
4. **04-insert-sample-data.sql** - Inserts sample data for testing and demonstration

## Setup Instructions

### Step 1: Run the SQL Files in Order

Go to your Supabase Dashboard → SQL Editor and run these files **in order**:

1. First run `01-create-tables.sql`
2. Then run `02-create-functions.sql`
3. Then run `03-enable-rls.sql`
4. Finally run `04-insert-sample-data.sql`

### Step 2: Verify the Setup

After running all files, you should have:

- **10 tables** created with proper relationships
- **Sample data** including:
  - 1 club (JKUAT Innovation and Entrepreneurship Club)
  - 3 users (admin, executive, member)
  - 1 sample event
  - 1 sample idea
  - 1 sample resource
  - 1 sample opportunity
  - 1 sample support ticket
  - 1 sample payment
  - 1 sample message

### Step 3: Test Login Credentials

You can test the system with these sample accounts:

**Admin Account:**
- Email: `admin@jkuatinnovation.ac.ke`
- Password: `admin123`
- Role: Administrator

**Executive Account:**
- Email: `executive@jkuatinnovation.ac.ke`
- Password: `admin123`
- Role: Executive

**Member Account:**
- Email: `member@jkuatinnovation.ac.ke`
- Password: `admin123`
- Role: Member

## Database Schema Overview

### Core Tables

- **clubs** - Club information and settings
- **users** - User accounts and profiles
- **events** - Club events and activities
- **event_attendees** - Event registration tracking
- **payments** - Payment records and transactions
- **ideas** - Innovation ideas and submissions
- **messages** - Internal messaging system
- **resources** - File and document sharing
- **opportunities** - Job/internship postings
- **support_tickets** - Help desk system

### Key Features

- **Row Level Security (RLS)** - Ensures users can only access data they're authorized to see
- **Automatic Timestamps** - All tables have `created_at` and `updated_at` fields
- **Data Validation** - Triggers ensure data integrity (e.g., event dates, payment amounts)
- **Auto-counting** - Member counts and attendee counts are automatically maintained
- **Flexible JSON Fields** - Settings, themes, and metadata stored as JSON for flexibility

### Security Policies

The RLS policies ensure:
- Users can only see data from their own club
- Admins and executives have additional permissions
- Personal data is protected (users can only edit their own profiles)
- Payment information is restricted to the user and club admins

## Customization

You can customize the setup by:

1. **Modifying club information** in `04-insert-sample-data.sql`
2. **Adding more sample data** as needed
3. **Adjusting RLS policies** in `03-enable-rls.sql` for different security requirements
4. **Adding custom functions** in `02-create-functions.sql` for business logic

## Troubleshooting

If you encounter errors:

1. **Check the order** - Files must be run in the specified order
2. **Check permissions** - Ensure you have admin access to your Supabase project
3. **Check for conflicts** - If re-running, some INSERT statements may conflict with existing data
4. **Check logs** - Supabase SQL Editor shows detailed error messages

## Next Steps

After setting up the database:

1. Update your `.env` file with the correct Supabase credentials
2. Test the connection using the MCP server
3. Run your Node.js application and verify all features work
4. Customize the sample data to match your club's needs

## Support

If you need help with the database setup, check:
- Supabase documentation: https://supabase.com/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Your project's `SETUP.md` file for additional configuration steps