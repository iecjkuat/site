#!/usr/bin/env node

/**
 * Check existing opportunities table schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking existing opportunities table schema...');

  try {
    // Get one record to see the structure
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (opportunities.length > 0) {
      console.log('📋 Existing opportunities table columns:');
      const columns = Object.keys(opportunities[0]);
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof opportunities[0][col]} (${opportunities[0][col]})`);
      });
      
      console.log('\n🔍 Missing columns for new schema:');
      const expectedColumns = [
        'category_id', 'organization', 'location_type', 'application_url', 
        'eligibility_criteria', 'compensation_type', 'compensation_amount',
        'start_date', 'duration_months', 'priority_level', 'is_featured'
      ];
      
      expectedColumns.forEach(col => {
        if (!columns.includes(col)) {
          console.log(`  ❌ Missing: ${col}`);
        } else {
          console.log(`  ✅ Exists: ${col}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

if (require.main === module) {
  checkSchema();
}