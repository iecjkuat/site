-- ============================================================================
-- EVENT REGISTRATION FUNCTIONS
-- ============================================================================

-- Function to increment event attendee count
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE events
    SET current_attendees = COALESCE(current_attendees, 0) + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement event attendee count
CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE events
    SET current_attendees = GREATEST(COALESCE(current_attendees, 0) - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update event attendee count on registration
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.registration_status IN ('confirmed', 'pending') THEN
            PERFORM increment_event_attendees(NEW.event_id);
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed from confirmed/pending to cancelled
        IF OLD.registration_status IN ('confirmed', 'pending') 
           AND NEW.registration_status = 'cancelled' THEN
            PERFORM decrement_event_attendees(NEW.event_id);
        END IF;
        -- If status changed from cancelled to confirmed/pending
        IF OLD.registration_status = 'cancelled' 
           AND NEW.registration_status IN ('confirmed', 'pending') THEN
            PERFORM increment_event_attendees(NEW.event_id);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.registration_status IN ('confirmed', 'pending') THEN
            PERFORM decrement_event_attendees(OLD.event_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS event_attendee_count_trigger ON event_attendees;

-- Create trigger
CREATE TRIGGER event_attendee_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON event_attendees
FOR EACH ROW
EXECUTE FUNCTION update_event_attendee_count();

-- Function to get event registration statistics
CREATE OR REPLACE FUNCTION get_event_registration_stats(event_id UUID)
RETURNS TABLE (
    total_registered BIGINT,
    confirmed BIGINT,
    pending BIGINT,
    waitlisted BIGINT,
    cancelled BIGINT,
    checked_in BIGINT,
    attended BIGINT,
    no_show BIGINT,
    payment_pending BIGINT,
    payment_completed BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE registration_status != 'cancelled') as total_registered,
        COUNT(*) FILTER (WHERE registration_status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE registration_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE registration_status = 'waitlisted') as waitlisted,
        COUNT(*) FILTER (WHERE registration_status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE attendance_status = 'checked_in') as checked_in,
        COUNT(*) FILTER (WHERE attendance_status = 'attended') as attended,
        COUNT(*) FILTER (WHERE attendance_status = 'no_show') as no_show,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as payment_pending,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as payment_completed
    FROM event_attendees
    WHERE event_attendees.event_id = get_event_registration_stats.event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to move waitlisted attendees to confirmed when spots open
CREATE OR REPLACE FUNCTION process_event_waitlist(event_id UUID)
RETURNS void AS $$
DECLARE
    available_spots INTEGER;
    event_max_attendees INTEGER;
    current_count INTEGER;
BEGIN
    -- Get event max attendees
    SELECT max_attendees INTO event_max_attendees
    FROM events
    WHERE id = event_id;
    
    -- If no max attendees, exit
    IF event_max_attendees IS NULL THEN
        RETURN;
    END IF;
    
    -- Get current confirmed count
    SELECT COUNT(*) INTO current_count
    FROM event_attendees
    WHERE event_attendees.event_id = process_event_waitlist.event_id
    AND registration_status IN ('confirmed', 'pending');
    
    -- Calculate available spots
    available_spots := event_max_attendees - current_count;
    
    -- If spots available, move waitlisted to pending using subquery
    IF available_spots > 0 THEN
        UPDATE event_attendees
        SET registration_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE id IN (
            SELECT id
            FROM event_attendees
            WHERE event_attendees.event_id = process_event_waitlist.event_id
            AND registration_status = 'waitlisted'
            ORDER BY created_at ASC
            LIMIT available_spots
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
