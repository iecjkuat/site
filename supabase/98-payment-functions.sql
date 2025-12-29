-- Function to atomicly process successful payments
-- Ensures both the payment record and the event attendance record are updated together.
CREATE OR REPLACE FUNCTION process_payment_success(
        p_payment_id UUID,
        p_event_id UUID,
        p_user_id UUID,
        p_receipt_number TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER -- Runs with privileges of the creator (system)
    AS $$
DECLARE v_payment_record RECORD;
BEGIN -- 1. Update Payment Record
UPDATE payments
SET status = 'completed',
    mpesa_receipt_number = p_receipt_number,
    completed_at = NOW()
WHERE id = p_payment_id
RETURNING * INTO v_payment_record;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'message',
    'Payment record not found'
);
END IF;
-- 2. Update Event Attendance
UPDATE event_attendees
SET payment_status = 'paid'
WHERE event_id = p_event_id
    AND user_id = p_user_id;
-- 3. Log the activity (Optional, but good practice if audit log table exists)
-- INSERT INTO activity_logs ... (Skipping to avoid dependency complexity here)
RETURN jsonb_build_object(
    'success',
    true,
    'message',
    'Payment processed successfully',
    'payment',
    row_to_json(v_payment_record)
);
EXCEPTION
WHEN OTHERS THEN -- Rollback happens automatically on error
RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;