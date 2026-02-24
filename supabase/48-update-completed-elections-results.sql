-- ============================================================================
-- Update Completed Elections to Show Results
-- ============================================================================
-- This script marks all completed elections as having visible results

-- Update elections that have ended to show results
UPDATE elections
SET results_visible = true
WHERE status = 'completed' 
   OR end_date < NOW();

-- Verify the update
SELECT 
    id,
    title,
    status,
    end_date,
    results_visible,
    CASE 
        WHEN end_date < NOW() THEN 'Ended'
        ELSE 'Active'
    END as actual_status
FROM elections
ORDER BY end_date DESC;
