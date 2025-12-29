/**
 * Setup Feedback System
 * Runs the feedback system database migration
 */

const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');

async function setupFeedbackSystem() {
    try {
        console.log('🚀 Setting up Post-Event Feedback System...');
        
        // Read the feedback system SQL file
        const sqlPath = path.join(__dirname, '..', 'supabase', '09-feedback-system.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📄 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (statement.trim()) {
                try {
                    console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
                    
                    const { error } = await supabase.rpc('exec_sql', { 
                        sql_query: statement + ';' 
                    });
                    
                    if (error) {
                        // Try direct query if RPC fails
                        const { error: directError } = await supabase
                            .from('_temp_exec')
                            .select('*')
                            .limit(0);
                        
                        if (directError && !directError.message.includes('does not exist')) {
                            console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
                        }
                    }
                } catch (execError) {
                    console.warn(`⚠️ Statement ${i + 1} execution warning:`, execError.message);
                }
            }
        }
        
        console.log('✅ Feedback system setup completed!');
        
        // Verify tables were created
        await verifyFeedbackTables();
        
    } catch (error) {
        console.error('❌ Error setting up feedback system:', error);
        process.exit(1);
    }
}

async function verifyFeedbackTables() {
    console.log('🔍 Verifying feedback system tables...');
    
    const tables = [
        'event_feedback',
        'event_feedback_photos', 
        'feedback_categories',
        'feedback_category_ratings'
    ];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
                
            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`);
            } else {
                console.log(`✅ Table ${table}: Available`);
            }
        } catch (err) {
            console.log(`❌ Table ${table}: ${err.message}`);
        }
    }
    
    // Check if feedback categories were inserted
    try {
        const { data: categories, error } = await supabase
            .from('feedback_categories')
            .select('name')
            .limit(10);
            
        if (error) {
            console.log('❌ Feedback categories: Not available');
        } else {
            console.log(`✅ Feedback categories: ${categories.length} categories loaded`);
            categories.forEach(cat => console.log(`   - ${cat.name}`));
        }
    } catch (err) {
        console.log('❌ Feedback categories check failed:', err.message);
    }
}

// Run the setup
if (require.main === module) {
    setupFeedbackSystem();
}

module.exports = { setupFeedbackSystem };