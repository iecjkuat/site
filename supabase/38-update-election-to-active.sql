-- Update the election to be active with current dates
UPDATE elections 
SET 
    status = 'active',
    start_date = NOW() - INTERVAL '1 day',
    end_date = NOW() + INTERVAL '6 days',
    results_visible = false
WHERE title = '2026 Leadership Elections';

-- Verify the update
SELECT id, title, status, start_date, end_date 
FROM elections 
WHERE title = '2026 Leadership Elections';
