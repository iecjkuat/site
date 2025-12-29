-- JKUAT Innovation and Entrepreneurship Club - Row Level Security
-- File 3: Enable RLS and Create Policies
-- Run this after creating tables and functions

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