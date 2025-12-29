#!/usr/bin/env node

/**
 * Check opportunity table constraints
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkConstraints() {
  console.log('🔍 Checking opportunity table constraints...');

  try {
    // Get existing opportunities to see what types are allowed
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('opportunity_type')
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📋 Existing opportunity types in database:');
    const types = [...new Set(opportunities.map(opp => opp.opportunity_type))];
    types.forEach(type => {
      console.log(`  - ${type}`);
    });

    // Try to insert a test record with different types to see what's allowed
    const testTypes = ['funding', 'grant', 'partnership', 'scholarship', 'competition', 'internship', 'job'];
    
    console.log('\n🧪 Testing allowed opportunity types...');
    
    for (const type of testTypes) {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .insert({
            title: `Test ${type}`,
            description: 'Test description',
            company: 'Test Company',
            location: 'Test Location',
            opportunity_type: type,
            application_deadline: '2025-12-31',
            requirements: ['Test requirement'],
            benefits: ['Test benefit'],
            status: 'active',
            tags: ['test'],
            posted_by: (await supabase.from('users').select('id').limit(1).single()).data.id
          })
          .select();

        if (error) {
          console.log(`  ❌ ${type}: ${error.message}`);
        } else {
          console.log(`  ✅ ${type}: Allowed`);
          // Clean up test record
          await supabase.from('opportunities').delete().eq('id', data[0].id);
        }
      } catch (err) {
        console.log(`  ❌ ${type}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

if (require.main === module) {
  checkConstraints();
}