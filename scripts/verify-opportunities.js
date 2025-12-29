#!/usr/bin/env node

/**
 * Verify Partnerships & Opportunities Data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyOpportunities() {
  console.log('🔍 Verifying Partnerships & Opportunities data...');

  try {
    // Get all opportunities
    const { data: opportunities, error, count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Total opportunities: ${count}`);
    
    // Group by type
    const byType = {};
    opportunities.forEach(opp => {
      byType[opp.opportunity_type] = (byType[opp.opportunity_type] || 0) + 1;
    });

    console.log('\n📋 Opportunities by type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\n📝 All opportunities:');
    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title} (${opp.opportunity_type}) - ${opp.company}`);
    });

    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/opportunities');
      if (response.ok) {
        const apiData = await response.json();
        console.log(`✅ API working: ${apiData.opportunities?.length || 0} opportunities returned`);
      } else {
        console.log(`⚠️ API response: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log(`⚠️ API not available: ${apiError.message}`);
      console.log('💡 This is fine - the frontend will use mock data fallback');
    }

    console.log('\n🎉 Verification complete!');
    console.log('🌐 Visit http://localhost:3000/opportunities to see the opportunities page');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  verifyOpportunities();
}