-- ============================================================================
-- JKUAT Innovation and Entrepreneurship Club - Core Database Schema
-- File 1: Core Tables (Users, Auth, Profiles)
-- ============================================================================
-- Run this FIRST in Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE (Main user accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Student Info
  student_id VARCHAR(50) UNIQUE,  -- Keep for backward compatibility
  registration_number VARCHAR(50) UNIQUE,  -- New standard field
  course VARCHAR(100),
  year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 6),
  college VARCHAR(100),
  
  -- Contact
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  
  -- Profile
  profile_picture VARCHAR(255),
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Professional
  linkedin_url VARCHAR(255),
  skills TEXT[],
  interests TEXT[],
  experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  goals TEXT[],
  
  -- Preferences
  preferred_communication VARCHAR(20) CHECK (preferred_communication IN ('email', 'sms', 'whatsapp', 'telegram')),
  additional_comments TEXT,
  profile_completed BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  
  -- Role & Status
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'executive', 'admin', 'super_admin')),
  membership_status VARCHAR(20) DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'inactive', 'suspended')),
  
  -- Verification
  email_verified BOOLEAN DEFAULT false,
  
  -- Session Management
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  token_version INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROFILES TABLE (Extended user profiles - Supabase Auth integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Mirror essential fields for Supabase Auth
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Additional profile data
  website TEXT,
  bio TEXT,
  location TEXT,
  
  -- Social media
  twitter_handle TEXT,
  github_username TEXT,
  linkedin_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for Users
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================================================
-- INDEXES for Profiles
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE users IS 'Main user accounts table with complete profile information';
COMMENT ON TABLE profiles IS 'Extended profiles for Supabase Auth integration';
COMMENT ON COLUMN users.student_id IS 'Legacy field - use registration_number instead';
COMMENT ON COLUMN users.registration_number IS 'Official JKUAT registration number';
COMMENT ON COLUMN users.token_version IS 'Incremented to invalidate all user tokens on password change';
