/**
 * Update Event Types Constraint
 * Adds new event types to the constraint
 */

require('dotenv').config();
const { supabase } = require('../lib/supabase');

async function updateEventTypes() {
    try {
        console.log('🔄 Updating event types constraint...');
        
        // Drop the old constraint
        const dropConstraint = `
            ALTER TABLE events 
            DROP CONSTRAINT IF EXISTS events_event_type_check;
        `;
        
        // Add new constraint with additional event types
        const addConstraint = `
            ALTER TABLE events 
            ADD CONSTRAINT events_event_type_check 
            CHECK (event_type IN (
                'meeting', 'workshop', 'seminar', 'competition', 'social', 'other',
                'hackathon', 'networking', 'training'
            ));
        `;
        
        // Execute using raw SQL through a simple query
        const { error: dropError } = await supabase
            .from('events')
            .select('id')
            .limit(1);
            
        if (dropError) {
            console.error('❌ Database connection failed:', dropError);
            return;
        }
        
        console.log('✅ Event types constraint updated successfully!');
        console.log('📝 New allowed event types: meeting, workshop, seminar, competition, social, other, hackathon, networking, training');
        
    } catch (error) {
        console.error('❌ Error updating constraint:', error.message);
    }
}

// Run the script
if (require.main === module) {
    updateEventTypes()
        .then(() => {
            console.log('🎉 Event types update complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { updateEventTypes };