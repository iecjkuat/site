#!/usr/bin/env node

/**
 * Verify Partnerships Schema Application
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifySchema() {
  console.log('🔍 Verifying Partnerships & Opportunities schema...');

  try {
    // Test 1: Check if opportunity_categories table exists
    console.log('📋 Checking opportunity_categories table...');
    const { data: categories, error: catError } = await supabase
      .from('opportunity_categories')
      .select('*')
      .limit(1);

    if (catError) {
      console.error('❌ opportunity_categories:', catError.message);
    } else {
      console.log('✅ opportunity_categories table exists');
    }

    // Test 2: Check if partnership_organizations table exists
    console.log('📋 Checking partnership_organizations table...');
    const { data: orgs, error: orgError } = await supabase
      .from('partnership_organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.error('❌ partnership_organizations:', orgError.message);
    } else {
      console.log('✅ partnership_organizations table exists');
    }

    // Test 3: Check if new columns were added to opportunities table
    console.log('📋 Checking opportunities table new columns...');
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('category_id, organization, location_type, eligibility_criteria, compensation_type, priority_level, is_featured')
      .limit(1);

    if (oppError) {
      console.error('❌ opportunities new columns:', oppError.message);
    } else {
      console.log('✅ opportunities table has new columns');
      if (opportunities.length > 0) {
        console.log('📊 Sample columns:', Object.keys(opportunities[0]));
      }
    }

    // Test 4: Check additional tables
    const additionalTables = [
      'opportunity_applications',
      'opportunity_bookmarks', 
      'opportunity_views',
      'user_opportunity_preferences',
      'opportunity_notifications'
    ];

    for (const tableName of additionalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ ${tableName}:`, error.message);
        } else {
          console.log(`✅ ${tableName} table exists`);
        }
      } catch (err) {
        console.error(`❌ ${tableName}:`, err.message);
      }
    }

    console.log('\n🎉 Schema verification complete!');
    console.log('\n📋 If all tables show ✅, the schema was applied successfully.');
    console.log('📋 If any show ❌, you may need to run the SQL manually in Supabase dashboard.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  verifySchema();
}

module.exports = verifySchema;