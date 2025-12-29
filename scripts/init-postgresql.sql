-- JKUAT Clubs Platform - PostgreSQL Database Initialization
-- This script sets up the database with Row Level Security (RLS) policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Clubs policies
CREATE POLICY "Clubs are viewable by everyone" ON clubs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Club members can view their club details" ON clubs
  FOR SELECT USING (
    id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert clubs" ON clubs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Club admins can update their club" ON clubs
  FOR UPDATE USING (
    id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

-- Users policies
CREATE POLICY "Users can view members of their club" ON users
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Anyone can insert users (registration)" ON users
  FOR INSERT WITH CHECK (true);

-- Events policies
CREATE POLICY "Users can view events in their club" ON events
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Club executives can manage events" ON events
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

-- Event attendees policies
CREATE POLICY "Users can view attendees of their club events" ON event_attendees
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    event_id IN (
      SELECT id FROM events 
      WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own registrations" ON event_attendees
  FOR UPDATE USING (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Club admins can view club payments" ON payments
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update payment status" ON payments
  FOR UPDATE USING (true);

-- Ideas policies
CREATE POLICY "Users can view ideas in their club" ON ideas
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can submit ideas to their club" ON ideas
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Club executives can manage all ideas" ON ideas
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages within their club" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    ) AND
    recipient_id IN (
      SELECT id FROM users 
      WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Resources policies
CREATE POLICY "Users can view resources based on access level" ON resources
  FOR SELECT USING (
    CASE access_level
      WHEN 'public' THEN true
      WHEN 'members' THEN club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
      WHEN 'executives' THEN club_id IN (
        SELECT club_id FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'executive')
      )
      WHEN 'admin' THEN club_id IN (
        SELECT club_id FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
      ELSE false
    END
  );

CREATE POLICY "Club members can upload resources" ON resources
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own resources" ON resources
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Club admins can manage all resources" ON resources
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

-- Opportunities policies
CREATE POLICY "Users can view opportunities in their club" ON opportunities
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Club members can post opportunities" ON opportunities
  FOR INSERT WITH CHECK (
    posted_by = auth.uid() AND
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own opportunities" ON opportunities
  FOR UPDATE USING (posted_by = auth.uid());

CREATE POLICY "Club executives can manage all opportunities" ON opportunities
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Club support staff can view club tickets" ON support_tickets
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    )
  );

CREATE POLICY "Assigned users can view their assigned tickets" ON support_tickets
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Users can create support tickets" ON support_tickets
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    club_id IN (
      SELECT club_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tickets" ON support_tickets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Support staff can manage tickets" ON support_tickets
  FOR UPDATE USING (
    club_id IN (
      SELECT club_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'executive')
    ) OR assigned_to = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_club_id ON users(club_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membership_status);

CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_club_id ON payments(club_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_ideas_club_id ON ideas(club_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_upvotes ON ideas(upvotes);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_club_id ON messages(club_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_resources_club_id ON resources(club_id);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_access_level ON resources(access_level);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

CREATE INDEX IF NOT EXISTS idx_opportunities_club_id ON opportunities(club_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_by ON opportunities(posted_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(application_deadline);

CREATE INDEX IF NOT EXISTS idx_support_tickets_club_id ON support_tickets(club_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_club_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT club_id FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_club_admin(user_uuid UUID, target_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid 
    AND club_id = target_club_id 
    AND role IN ('admin', 'executive')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables that have updated_at column
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO clubs (
  id, name, short_name, description, email, phone, website, faculty, 
  advisor_name, advisor_email, status, established_date, settings, theme
) VALUES (
  uuid_generate_v4(),
  'JKUAT Innovation and Entrepreneurship Club',
  'JIEC',
  'Fostering innovation and entrepreneurship among JKUAT students through mentorship, networking, and practical business development opportunities.',
  'info@jkuatinnovation.ac.ke',
  '+254700000000',
  'https://jkuatinnovation.ac.ke',
  'Engineering',
  'Dr. Innovation Mentor',
  'mentor@jkuat.ac.ke',
  'active',
  '2020-01-15',
  '{
    "membershipFee": 500,
    "allowSelfRegistration": true,
    "requireApproval": false,
    "features": {
      "events": true,
      "payments": true,
      "messaging": true,
      "ideasHub": true,
      "resources": true,
      "opportunities": true,
      "support": true
    },
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }',
  '{
    "primaryColor": "#1e40af",
    "secondaryColor": "#3b82f6",
    "accentColor": "#10b981",
    "logo": "/images/jiec-logo.png",
    "banner": "/images/jiec-banner.jpg"
  }'
) ON CONFLICT DO NOTHING;

-- Create a sample admin user (password: admin123)
-- Note: In production, this should be created through the registration process
INSERT INTO users (
  id, club_id, name, email, phone, password_hash, registration_number,
  course, year_of_study, college, role, membership_status, email_verified
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM clubs WHERE short_name = 'JIEC' LIMIT 1),
  'System Administrator',
  'admin@jkuatinnovation.ac.ke',
  '+254700000001',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxl9OfvG', -- admin123
  'EN111-0001/2020',
  'Computer Science',
  4,
  'Engineering',
  'admin',
  'active',
  true
) ON CONFLICT DO NOTHING;

-- Create sample categories for better organization
INSERT INTO ideas (
  id, club_id, user_id, title, description, category, tags, status, upvotes
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM clubs WHERE short_name = 'JIEC' LIMIT 1),
  (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
  'Welcome to JKUAT Innovation Hub',
  'This is a sample idea to demonstrate the Ideas Hub functionality. Students can submit innovative ideas, collaborate with peers, and get feedback from mentors.',
  'Technology',
  ARRAY['innovation', 'technology', 'collaboration'],
  'approved',
  5
) ON CONFLICT DO NOTHING;

-- Create sample resource categories
INSERT INTO resources (
  id, club_id, uploaded_by, title, description, category, tags, access_level, file_type
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM clubs WHERE short_name = 'JIEC' LIMIT 1),
  (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
  'Club Handbook 2024',
  'Complete guide for new members including club rules, activities, and opportunities.',
  'Documentation',
  ARRAY['handbook', 'guide', 'rules'],
  'members',
  'PDF'
) ON CONFLICT DO NOTHING;

-- Create sample opportunity
INSERT INTO opportunities (
  id, club_id, posted_by, title, description, company, location, opportunity_type,
  application_deadline, requirements, benefits, status
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM clubs WHERE short_name = 'JIEC' LIMIT 1),
  (SELECT id FROM users WHERE email = 'admin@jkuatinnovation.ac.ke' LIMIT 1),
  'Software Development Internship',
  'Join our team as a software development intern and gain hands-on experience with modern web technologies.',
  'TechCorp Kenya',
  'Nairobi, Kenya',
  'Internship',
  CURRENT_DATE + INTERVAL '30 days',
  ARRAY['Programming skills', 'Team collaboration', 'Problem solving'],
  ARRAY['Mentorship', 'Certificate', 'Networking opportunities'],
  'active'
) ON CONFLICT DO NOTHING;

COMMIT;