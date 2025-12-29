-- JKUAT Innovation and Entrepreneurship Club - Database Functions
-- File 2: Create Functions and Triggers
-- Run this after creating tables

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's club ID
CREATE OR REPLACE FUNCTION get_user_club_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT club_id FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is club admin
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

-- Function to update club member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clubs 
    SET member_count = (
      SELECT COUNT(*) FROM users 
      WHERE club_id = NEW.club_id 
      AND membership_status = 'active'
    )
    WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update count for both old and new club if club_id changed
    IF OLD.club_id != NEW.club_id THEN
      UPDATE clubs 
      SET member_count = (
        SELECT COUNT(*) FROM users 
        WHERE club_id = OLD.club_id 
        AND membership_status = 'active'
      )
      WHERE id = OLD.club_id;
    END IF;
    
    UPDATE clubs 
    SET member_count = (
      SELECT COUNT(*) FROM users 
      WHERE club_id = NEW.club_id 
      AND membership_status = 'active'
    )
    WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clubs 
    SET member_count = (
      SELECT COUNT(*) FROM users 
      WHERE club_id = OLD.club_id 
      AND membership_status = 'active'
    )
    WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET max_attendees = COALESCE(max_attendees, 0) + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET max_attendees = GREATEST(COALESCE(max_attendees, 0) - 1, 0)
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update resource download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources 
  SET download_count = download_count + 1
  WHERE id = NEW.resource_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate event dates
CREATE OR REPLACE FUNCTION validate_event_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if end_date is after start_date
  IF NEW.end_date IS NOT NULL AND NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'Event end date must be after start date';
  END IF;
  
  -- Check if registration_deadline is before start_date
  IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline >= NEW.start_date THEN
    RAISE EXCEPTION 'Registration deadline must be before event start date';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate payment amount
CREATE OR REPLACE FUNCTION validate_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign support tickets
CREATE OR REPLACE FUNCTION auto_assign_support_ticket()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Auto-assign to a club admin if not already assigned
  IF NEW.assigned_to IS NULL THEN
    SELECT id INTO admin_user_id
    FROM users 
    WHERE club_id = NEW.club_id 
    AND role IN ('admin', 'executive')
    AND membership_status = 'active'
    ORDER BY last_login DESC NULLS LAST
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
      NEW.assigned_to = admin_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_clubs_updated_at 
  BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at 
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at 
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply member count trigger
CREATE TRIGGER update_club_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Apply event validation trigger
CREATE TRIGGER validate_event_dates_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION validate_event_dates();

-- Apply payment validation trigger
CREATE TRIGGER validate_payment_amount_trigger
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION validate_payment_amount();

-- Apply support ticket auto-assignment trigger
CREATE TRIGGER auto_assign_support_ticket_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION auto_assign_support_ticket();