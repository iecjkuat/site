#!/usr/bin/env node

/**
 * Test Opportunities API
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testAPI() {
  console.log('🔍 Testing Opportunities API...');

  try {
    // Test 1: Simple opportunities query
    console.log('📋 Testing simple opportunities query...');
    const { data: simpleOpps, error: simpleError } = await supabase
      .from('opportunities')
      .select('*')
      .limit(5);

    if (simpleError) {
      console.error('❌ Simple query failed:', simpleError);
    } else {
      console.log(`✅ Simple query works: ${simpleOpps.length} opportunities`);
    }

    // Test 2: Check if opportunity_categories table exists and has data
    console.log('📋 Testing opportunity_categories...');
    const { data: categories, error: catError } = await supabase
      .from('opportunity_categories')
      .select('*');

    if (catError) {
      console.error('❌ Categories query failed:', catError);
    } else {
      console.log(`✅ Categories query works: ${categories.length} categories`);
      if (categories.length > 0) {
        console.log('Sample category:', categories[0]);
      }
    }

    // Test 3: Test the complex join query that the API uses
    console.log('📋 Testing complex join query...');
    const { data: complexOpps, error: complexError } = await supabase
      .from('opportunities')
      .select(`
        *,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('status', 'active')
      .limit(3);

    if (complexError) {
      console.error('❌ Complex query failed:', complexError);
    } else {
      console.log(`✅ Complex query works: ${complexOpps.length} opportunities`);
      if (complexOpps.length > 0) {
        console.log('Sample opportunity with category:', {
          title: complexOpps[0].title,
          organization: complexOpps[0].organization,
          category: complexOpps[0].category
        });
      }
    }

    // Test 4: Check if there are opportunities with category_id set
    console.log('📋 Testing opportunities with category_id...');
    const { data: oppsWithCat, error: catOppsError } = await supabase
      .from('opportunities')
      .select('id, title, category_id, organization')
      .not('category_id', 'is', null)
      .limit(5);

    if (catOppsError) {
      console.error('❌ Category_id query failed:', catOppsError);
    } else {
      console.log(`✅ Found ${oppsWithCat.length} opportunities with category_id`);
      oppsWithCat.forEach(opp => {
        console.log(`  - ${opp.title}: category_id = ${opp.category_id}`);
      });
    }

    // Test 5: Test the exact API query
    console.log('📋 Testing exact API query...');
    try {
      const { data: apiOpps, error: apiError, count } = await supabase
        .from('opportunities')
        .select(`
          *,
          category:opportunity_categories(name, icon, color),
          applications:opportunity_applications(count),
          bookmarks:opportunity_bookmarks(count)
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(0, 19);

      if (apiError) {
        console.error('❌ API query failed:', apiError);
      } else {
        console.log(`✅ API query works: ${apiOpps.length} opportunities, total: ${count}`);
      }
    } catch (err) {
      console.error('❌ API query exception:', err.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testAPI();
}