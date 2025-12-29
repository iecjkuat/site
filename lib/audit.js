const { supabase } = require('./supabase');

/**
 * Log a user activity/security event
 * @param {string} userId - UUID of the user
 * @param {string} action - Action name (e.g., 'LOGIN', 'UPDATE_PROFILE', 'PAYMENT_INITIATED', 'DELETE_ACCOUNT')
 * @param {object} details - JSON object with additional details (ip, user-agent, metadata)
 * @param {string} entityType - Optional, e.g., 'USER', 'EVENT', 'PAYMENT'
 * @param {string} entityId - Optional, ID of the entity acted upon
 */
async function logActivity(userId, action, details = {}, entityType = null, entityId = null) {
    try {
        const { error } = await supabase.from('activity_logs').insert({
            user_id: userId,
            action: action,
            details: details,
            entity_type: entityType,
            entity_id: entityId,
            ip_address: details.ip || null,
            user_agent: details.userAgent || null,
            created_at: new Date().toISOString()
        });

        if (error) {
            // Start fail-safe: If table doesn't exist or other error, just console log it so we don't crash
            console.error('FAILED TO WRITE AUDIT LOG:', action, error.message);
        }
    } catch (err) {
        console.error('Audit log exception:', err);
    }
}

module.exports = { logActivity };
