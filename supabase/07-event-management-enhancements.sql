-- JKUAT Innovation Club - Event Management Enhancements
-- Additional tables and features for comprehensive event management

-- ============================================================================
-- EVENT NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'reminder', 'update', 'cancellation', 'confirmation'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  notification_method VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'push', 'in_app'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT REMINDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'push', 'in_app'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed', 'cancelled'
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id, reminder_time)
);

-- ============================================================================
-- EVENT UPDATES/ANNOUNCEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  update_type VARCHAR(50) DEFAULT 'general', -- 'general', 'schedule_change', 'venue_change', 'cancellation', 'important'
  is_urgent BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- QR CODE ATTENDANCE TRACKING ENHANCEMENTS
-- ============================================================================

-- Add QR code and attendance tracking columns to event_attendees
ALTER TABLE event_attendees 
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_in_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS attendance_notes TEXT,
ADD COLUMN IF NOT EXISTS attendance_verified_by UUID REFERENCES users(id);

-- ============================================================================
-- EVENT FEEDBACK TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  would_recommend BOOLEAN,
  suggestions TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- EVENT RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  resource_name VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL, -- 'presentation', 'document', 'video', 'link', 'material'
  file_url VARCHAR(500),
  file_size BIGINT,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT CALENDAR INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  calendar_type VARCHAR(50) NOT NULL, -- 'google', 'outlook', 'apple', 'ical'
  external_event_id VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed', 'removed'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL, -- 'page_views', 'registrations', 'check_ins', 'feedback_submissions'
  metric_value INTEGER DEFAULT 0,
  recorded_date DATE DEFAULT CURRENT_DATE,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, metric_name, recorded_date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Event notifications indexes
CREATE INDEX IF NOT EXISTS idx_event_notifications_user ON event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_event ON event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_sent ON event_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_event_notifications_read ON event_notifications(read_at);

-- Event reminders indexes
CREATE INDEX IF NOT EXISTS idx_event_reminders_user ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_time ON event_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_event_reminders_status ON event_reminders(status);

-- Event updates indexes
CREATE INDEX IF NOT EXISTS idx_event_updates_event ON event_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_event_updates_published ON event_updates(published_at);
CREATE INDEX IF NOT EXISTS idx_event_updates_urgent ON event_updates(is_urgent);

-- Event attendees attendance indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_checkin ON event_attendees(check_in_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendance ON event_attendees(attendance_status);

-- Event feedback indexes
CREATE INDEX IF NOT EXISTS idx_event_feedback_event ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_rating ON event_feedback(rating);

-- Event resources indexes
CREATE INDEX IF NOT EXISTS idx_event_resources_event ON event_resources(event_id);
CREATE INDEX IF NOT EXISTS idx_event_resources_type ON event_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_event_resources_public ON event_resources(is_public);

-- Calendar integrations indexes
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_event ON calendar_integrations(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_sync ON calendar_integrations(sync_status);

-- Event analytics indexes
CREATE INDEX IF NOT EXISTS idx_event_analytics_event ON event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_analytics_metric ON event_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_event_analytics_date ON event_analytics(recorded_date);

-- ============================================================================
-- FUNCTIONS FOR EVENT MANAGEMENT
-- ============================================================================

-- Function to automatically create reminders for new registrations
CREATE OR REPLACE FUNCTION create_event_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 24-hour reminder
  INSERT INTO event_reminders (user_id, event_id, reminder_time, reminder_type, message)
  SELECT 
    NEW.user_id,
    NEW.event_id,
    e.start_date - INTERVAL '1 day',
    'email',
    'Don''t forget about your upcoming event: ' || e.title
  FROM events e
  WHERE e.id = NEW.event_id
    AND e.start_date > NOW() + INTERVAL '1 day';
  
  -- Create 1-hour reminder
  INSERT INTO event_reminders (user_id, event_id, reminder_time, reminder_type, message)
  SELECT 
    NEW.user_id,
    NEW.event_id,
    e.start_date - INTERVAL '1 hour',
    'push',
    'Your event starts in 1 hour: ' || e.title
  FROM events e
  WHERE e.id = NEW.event_id
    AND e.start_date > NOW() + INTERVAL '1 hour';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create reminders on registration
DROP TRIGGER IF EXISTS trigger_create_event_reminders ON event_attendees;
CREATE TRIGGER trigger_create_event_reminders
  AFTER INSERT ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION create_event_reminders();

-- Function to update event analytics
CREATE OR REPLACE FUNCTION update_event_analytics(
  p_event_id UUID,
  p_metric_name VARCHAR(100),
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO event_analytics (event_id, metric_name, metric_value, recorded_date)
  VALUES (p_event_id, p_metric_name, p_increment, CURRENT_DATE)
  ON CONFLICT (event_id, metric_name, recorded_date)
  DO UPDATE SET 
    metric_value = event_analytics.metric_value + p_increment,
    created_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get event statistics
CREATE OR REPLACE FUNCTION get_event_statistics(p_event_id UUID)
RETURNS TABLE(
  total_registered INTEGER,
  total_attended INTEGER,
  total_no_show INTEGER,
  attendance_rate DECIMAL(5,2),
  average_rating DECIMAL(3,2),
  feedback_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ea.id)::INTEGER as total_registered,
    COUNT(CASE WHEN ea.attendance_status = 'attended' THEN 1 END)::INTEGER as total_attended,
    COUNT(CASE WHEN ea.attendance_status = 'no_show' THEN 1 END)::INTEGER as total_no_show,
    CASE 
      WHEN COUNT(ea.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN ea.attendance_status = 'attended' THEN 1 END)::DECIMAL / COUNT(ea.id)) * 100, 2)
      ELSE 0
    END as attendance_rate,
    COALESCE(AVG(ef.rating), 0)::DECIMAL(3,2) as average_rating,
    COUNT(ef.id)::INTEGER as feedback_count
  FROM event_attendees ea
  LEFT JOIN event_feedback ef ON ef.event_id = ea.event_id
  WHERE ea.event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample event updates
INSERT INTO event_updates (event_id, author_id, title, content, update_type, is_urgent) 
SELECT 
  e.id,
  u.id,
  'Important Update: Venue Change',
  'Due to unforeseen circumstances, the venue for this event has been changed to the Main Auditorium. Please note the new location and plan accordingly.',
  'venue_change',
  true
FROM events e
CROSS JOIN users u
WHERE u.role = 'admin'
LIMIT 1;

-- Insert sample event resources
INSERT INTO event_resources (event_id, resource_name, resource_type, description, uploaded_by)
SELECT 
  e.id,
  'Event Presentation Slides',
  'presentation',
  'Main presentation slides for the workshop',
  u.id
FROM events e
CROSS JOIN users u
WHERE u.role = 'admin'
LIMIT 3;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'JKUAT Innovation Club Event Management Enhancements Complete!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Enhanced features:';
    RAISE NOTICE '• Event notifications and reminders system';
    RAISE NOTICE '• QR code attendance tracking';
    RAISE NOTICE '• Live event updates and announcements';
    RAISE NOTICE '• Event feedback and rating system';
    RAISE NOTICE '• Event resources and materials sharing';
    RAISE NOTICE '• Calendar integration support';
    RAISE NOTICE '• Comprehensive event analytics';
    RAISE NOTICE '• Automated reminder creation';
    RAISE NOTICE '=================================================================';
END $$;