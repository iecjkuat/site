/**
 * Diagnostic Script - Test Feedback Flow
 * Run this to check if everything is working
 */

require('dotenv').config();
const { supabaseAdmin: supabase } = require('./lib/supabase');

async function testFlow() {
    console.log('🔍 ========== TESTING FEEDBACK FLOW ==========\n');

    // Step 1: Check if event_feedback table exists
    console.log('Step 1: Checking event_feedback table...');
    try {
        const { data, error } = await supabase
            .from('event_feedback')
            .select('*')
            .limit(1);
        
        if (error) {
            console.log('❌ Table query error:', error.message);
            console.log('   Code:', error.code);
            console.log('   Details:', error.details);
        } else {
            console.log('✅ Table exists');
            console.log('   Sample row:', data[0] || 'No data');
            if (data[0]) {
                console.log('   Columns:', Object.keys(data[0]));
            }
        }
    } catch (err) {
        console.log('❌ Exception:', err.message);
    }

    console.log('\nStep 2: Checking events table for "General Feedback"...');
    try {
        const { data, error } = await supabase
            .from('events')
            .select('id, title')
            .eq('title', 'General Feedback')
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('⚠️  "General Feedback" event does not exist');
                console.log('   Will be created on first submission');
            } else {
                console.log('❌ Error:', error.message);
            }
        } else {
            console.log('✅ "General Feedback" event exists');
            console.log('   ID:', data.id);
        }
    } catch (err) {
        console.log('❌ Exception:', err.message);
    }

    console.log('\nStep 3: Testing insert...');
    try {
        // Get or create event
        let eventId;
        const { data: existingEvent } = await supabase
            .from('events')
            .select('id')
            .eq('title', 'General Feedback')
            .single();

        if (existingEvent) {
            eventId = existingEvent.id;
        } else {
            console.log('   Creating "General Feedback" event...');
            const { data: newEvent, error: createError } = await supabase
                .from('events')
                .insert({
                    title: 'General Feedback',
                    description: 'Container for feedback and reviews',
                    start_date: '2099-12-31T00:00:00Z',
                    end_date: '2099-12-31T23:59:59Z',
                    location: 'Online',
                    status: 'upcoming' // Try 'upcoming' instead of 'published'
                })
                .select()
                .single();

            if (createError) {
                console.log('❌ Error creating event:', createError.message);
                return;
            }
            eventId = newEvent.id;
            console.log('✅ Event created:', eventId);
        }

        // Try to insert test feedback
        console.log('   Inserting test whisper...');
        const { data: feedback, error: insertError } = await supabase
            .from('event_feedback')
            .insert({
                event_id: eventId,
                user_id: null,
                rating: 5,
                suggestions: 'TEST WHISPER - ' + new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.log('❌ Insert error:', insertError.message);
            console.log('   Code:', insertError.code);
            console.log('   Details:', insertError.details);
        } else {
            console.log('✅ Test whisper inserted!');
            console.log('   ID:', feedback.id);
            console.log('   Data:', feedback);
        }
    } catch (err) {
        console.log('❌ Exception:', err.message);
    }

    console.log('\nStep 4: Querying whispers...');
    try {
        const { data: whispers, error } = await supabase
            .from('event_feedback')
            .select('id, suggestions, user_id')
            .is('user_id', null)
            .order('id', { ascending: false })
            .limit(5);

        if (error) {
            console.log('❌ Query error:', error.message);
        } else {
            console.log('✅ Whispers found:', whispers.length);
            whispers.forEach((w, i) => {
                console.log(`   ${i + 1}. ${w.suggestions.substring(0, 50)}...`);
            });
        }
    } catch (err) {
        console.log('❌ Exception:', err.message);
    }

    console.log('\n🔍 ========== TEST COMPLETE ==========');
    process.exit(0);
}

testFlow().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
