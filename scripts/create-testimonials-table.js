// Script to create testimonials table
require('dotenv').config();
const { supabase } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

async function createTestimonialsTable() {
    try {
        console.log('📝 Creating testimonials table...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../supabase/25-testimonials-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL into individual statements (rough split by semicolon)
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                
                const { error } = await supabase.rpc('exec_sql', { 
                    sql_query: statement + ';' 
                });
                
                if (error) {
                    console.error(`Error in statement ${i + 1}:`, error);
                    // Continue with other statements
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        console.log('✅ Testimonials table creation completed!');
        
        // Test the table by fetching testimonials
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .limit(5);
            
        if (error) {
            console.error('❌ Error testing testimonials table:', error);
        } else {
            console.log(`✅ Testimonials table working! Found ${data?.length || 0} testimonials`);
        }
        
    } catch (error) {
        console.error('❌ Error creating testimonials table:', error);
    }
}

// Run the migration
createTestimonialsTable();