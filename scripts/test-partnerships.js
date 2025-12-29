#!/usr/bin/env node

/**
 * Test Partnerships & Opportunities System
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testPartnerships() {
  console.log('🔍 Testing Partnerships & Opportunities System...');

  try {
    // Test if opportunity_categories table exists
    console.log('📋 Checking opportunity_categories table...');
    const { data: categories, error: catError } = await supabase
      .from('opportunity_categories')
      .select('*')
      .limit(5);

    if (catError) {
      console.error('❌ opportunity_categories table error:', catError);
    } else {
      console.log(`✅ opportunity_categories table exists with ${categories.length} records`);
      if (categories.length > 0) {
        console.log('Sample category:', categories[0]);
      }
    }

    // Test if opportunities table exists
    console.log('📋 Checking opportunities table...');
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .limit(5);

    if (oppError) {
      console.error('❌ opportunities table error:', oppError);
    } else {
      console.log(`✅ opportunities table exists with ${opportunities.length} records`);
      if (opportunities.length > 0) {
        console.log('Sample opportunity:', opportunities[0]);
      }
    }

    // Test if partnership_organizations table exists
    console.log('📋 Checking partnership_organizations table...');
    const { data: orgs, error: orgError } = await supabase
      .from('partnership_organizations')
      .select('*')
      .limit(5);

    if (orgError) {
      console.error('❌ partnership_organizations table error:', orgError);
    } else {
      console.log(`✅ partnership_organizations table exists with ${orgs.length} records`);
      if (orgs.length > 0) {
        console.log('Sample organization:', orgs[0]);
      }
    }

    // Test if users table exists (needed for foreign keys)
    console.log('📋 Checking users table...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);

    if (userError) {
      console.error('❌ users table error:', userError);
    } else {
      console.log(`✅ users table exists with ${users.length} records`);
      if (users.length > 0) {
        console.log('Sample users:', users.map(u => u.email));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testPartnerships();
}

module.exports = testPartnerships;