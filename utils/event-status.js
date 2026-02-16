/**
 * Event Status Utility
 * Automatically calculates event status based on dates
 */

/**
 * Calculate event status based on start and end dates
 * @param {string|Date} startDate - Event start date
 * @param {string|Date} endDate - Event end date
 * @param {string} manualStatus - Manual status (draft/cancelled)
 * @returns {string} - Calculated status
 */
function calculateEventStatus(startDate, endDate, manualStatus = null) {
    // If manually set to draft or cancelled, respect that
    if (manualStatus === 'draft' || manualStatus === 'cancelled') {
        return manualStatus;
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'draft'; // Default to draft if dates are invalid
    }

    // Calculate status based on current time
    if (now < start) {
        return 'upcoming';
    } else if (now >= start && now <= end) {
        return 'live';
    } else {
        return 'completed';
    }
}

/**
 * Add calculated status to event object
 * @param {Object} event - Event object
 * @returns {Object} - Event with calculated status
 */
function enrichEventWithStatus(event) {
    if (!event) return event;
    
    const calculatedStatus = calculateEventStatus(
        event.start_date,
        event.end_date,
        event.status
    );
    
    return {
        ...event,
        status: calculatedStatus,
        manual_status: event.status // Preserve original manual status
    };
}

/**
 * Add calculated status to array of events
 * @param {Array} events - Array of event objects
 * @returns {Array} - Events with calculated status
 */
function enrichEventsWithStatus(events) {
    if (!Array.isArray(events)) return events;
    return events.map(enrichEventWithStatus);
}

module.exports = {
    calculateEventStatus,
    enrichEventWithStatus,
    enrichEventsWithStatus
};
