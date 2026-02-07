-- ============================================================================
-- JKUAT Innovation and Entrepreneurship Club - Events System
-- File 2: Events, Attendees, Registrations
-- ============================================================================

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'workshop', 'seminar', 'competition', 'hackathon', 'social', 'conference', 'other')),
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Location
  location VARCHAR(255),
  venue_details TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_link TEXT,
  
  -- Registration
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  
  -- Payment
  fee DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'KES',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'live', 'ongoing', 'completed', 'cancelled')),
  
  -- Media
  banner_image TEXT,
  gallery JSONB DEFAULT '[]',
  
  -- Additional Info
  tags TEXT[],
  attachments JSONB DEFAULT '[]',
  requirements TEXT[],
  agenda JSONB DEFAULT '[]',
  
  -- Social Features
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Organizer
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  organizers UUID[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- EVENT ATTENDEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Registration
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')),
  
  -- Attendance
  attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'checked_in', 'attended', 'no_show', 'cancelled')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived', 'refunded')),
  payment_id UUID,
  amount_paid DECIMAL(10,2),
  
  -- Additional
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  -- QR Code for check-in
  qr_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- EVENT COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Comment
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES event_comments(id) ON DELETE CASCADE,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- EVENT SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  platform VARCHAR(50), -- 'twitter', 'facebook', 'whatsapp', 'email', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendance_status ON event_attendees(attendance_status);
CREATE INDEX IF NOT EXISTS idx_event_attendees_payment_status ON event_attendees(payment_status);

CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user_id ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_parent_id ON event_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON event_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_event_shares_event_id ON event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_user_id ON event_shares(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at BEFORE UPDATE ON event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_comments_updated_at BEFORE UPDATE ON event_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE events IS 'Events with Instagram-style social features';
COMMENT ON TABLE event_attendees IS 'Event registrations and attendance tracking';
COMMENT ON TABLE event_comments IS 'Comments on events (supports nested replies)';
COMMENT ON TABLE event_likes IS 'Event likes tracking';
COMMENT ON TABLE event_shares IS 'Event shares tracking';
