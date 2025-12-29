#!/usr/bin/env node

/**
 * Database Setup Script for Supabase
 * Creates all necessary tables and policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up JKUAT Clubs Platform database...');

  try {
    // Create tables using SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create enums
        DO $$ BEGIN
          CREATE TYPE club_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE membership_status AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED', 'SUSPENDED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('MEMBER', 'EXECUTIVE', 'ADMIN');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE attendance_status AS ENUM ('REGISTERED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE idea_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE message_type AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE access_level AS ENUM ('PUBLIC', 'MEMBERS', 'EXECUTIVES', 'ADMIN');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE opportunity_status AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
          CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        -- Create clubs table
        CREATE TABLE IF NOT EXISTS clubs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          short_name VARCHAR(20) UNIQUE NOT NULL,
          description TEXT NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          website VARCHAR(255),
          faculty VARCHAR(100) NOT NULL,
          advisor_name VARCHAR(255) NOT NULL,
          advisor_email VARCHAR(255) NOT NULL,
          settings JSONB DEFAULT '{}',
          theme JSONB DEFAULT '{}',
          status club_status DEFAULT 'PENDING',
          established_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          registration_number VARCHAR(50) UNIQUE NOT NULL,
          course VARCHAR(255) NOT NULL,
          year_of_study INTEGER NOT NULL,
          college VARCHAR(100) NOT NULL,
          profile_photo VARCHAR(500),
          bio TEXT,
          skills TEXT[] DEFAULT '{}',
          interests TEXT[] DEFAULT '{}',
          social_media JSONB DEFAULT '{}',
          membership_status membership_status DEFAULT 'PENDING',
          membership_number VARCHAR(50),
          role user_role DEFAULT 'MEMBER',
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          last_login TIMESTAMPTZ,
          login_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create events table
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255),
          venue VARCHAR(255),
          start_date TIMESTAMPTZ NOT NULL,
          end_date TIMESTAMPTZ NOT NULL,
          registration_deadline TIMESTAMPTZ,
          max_attendees INTEGER,
          registration_fee DECIMAL(10,2) DEFAULT 0,
          status event_status DEFAULT 'DRAFT',
          requirements TEXT[] DEFAULT '{}',
          tags TEXT[] DEFAULT '{}',
          image_url VARCHAR(500),
          organizer_id UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create event_attendees table
        CREATE TABLE IF NOT EXISTS event_attendees (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          registration_date TIMESTAMPTZ DEFAULT NOW(),
          attendance_status attendance_status DEFAULT 'REGISTERED',
          payment_status payment_status DEFAULT 'PENDING',
          UNIQUE(event_id, user_id)
        );

        -- Create payments table
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'KES',
          payment_type VARCHAR(50) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          status transaction_status DEFAULT 'PENDING',
          transaction_id VARCHAR(255),
          reference_number VARCHAR(255),
          provider_response JSONB,
          event_id UUID REFERENCES events(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create ideas table
        CREATE TABLE IF NOT EXISTS ideas (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100),
          tags TEXT[] DEFAULT '{}',
          status idea_status DEFAULT 'DRAFT',
          looking_for_collaborators BOOLEAN DEFAULT FALSE,
          required_skills TEXT[] DEFAULT '{}',
          attachments JSONB DEFAULT '[]',
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create messages table
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
          subject VARCHAR(255),
          content TEXT NOT NULL,
          message_type message_type DEFAULT 'DIRECT',
          read_at TIMESTAMPTZ,
          replied_at TIMESTAMPTZ,
          parent_message_id UUID REFERENCES messages(id),
          attachments JSONB DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create resources table
        CREATE TABLE IF NOT EXISTS resources (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          tags TEXT[] DEFAULT '{}',
          file_url VARCHAR(500),
          file_name VARCHAR(255),
          file_size BIGINT,
          file_type VARCHAR(100),
          access_level access_level DEFAULT 'MEMBERS',
          download_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create opportunities table
        CREATE TABLE IF NOT EXISTS opportunities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          posted_by UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          company VARCHAR(255),
          location VARCHAR(255),
          opportunity_type VARCHAR(50) NOT NULL,
          application_deadline DATE,
          requirements TEXT[] DEFAULT '{}',
          benefits TEXT[] DEFAULT '{}',
          external_url VARCHAR(500),
          application_process TEXT,
          status opportunity_status DEFAULT 'ACTIVE',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create support_tickets table
        CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          subject VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100),
          priority priority DEFAULT 'MEDIUM',
          status ticket_status DEFAULT 'OPEN',
          assigned_to UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_users_club_id ON users(club_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);
        CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
        CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
        CREATE INDEX IF NOT EXISTS idx_payments_club_id ON payments(club_id);
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_ideas_club_id ON ideas(club_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
        CREATE INDEX IF NOT EXISTS idx_resources_club_id ON resources(club_id);
        CREATE INDEX IF NOT EXISTS idx_opportunities_club_id ON opportunities(club_id);
        CREATE INDEX IF NOT EXISTS idx_support_tickets_club_id ON support_tickets(club_id);

        -- Create updated_at trigger function
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Create triggers for updated_at
        DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
        CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_events_updated_at ON events;
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
        CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
        CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
        CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
        CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
        CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error) {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    }

    console.log('✅ Database tables created successfully!');
    console.log('📊 Tables: clubs, users, events, payments, ideas, messages, resources, opportunities, support_tickets');
    console.log('🔧 Next step: Run "npm run db:seed" to add sample data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;