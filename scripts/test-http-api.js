#!/usr/bin/env node

/**
 * Test HTTP API endpoints
 */

async function testHTTPAPI() {
  console.log('🌐 Testing HTTP API endpoints...');

  try {
    // Test the opportunities endpoint
    console.log('📋 Testing GET /api/opportunities...');
    
    const response = await fetch('http://localhost:3000/api/opportunities');
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API works: ${data.opportunities?.length || 0} opportunities returned`);
      console.log('Pagination:', data.pagination);
      
      if (data.opportunities && data.opportunities.length > 0) {
        console.log('Sample opportunity:', {
          title: data.opportunities[0].title,
          organization: data.opportunities[0].organization,
          category: data.opportunities[0].category
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API failed:', errorText);
    }

    // Test categories endpoint
    console.log('\n📋 Testing GET /api/opportunities/categories...');
    const catResponse = await fetch('http://localhost:3000/api/opportunities/categories');
    console.log(`Categories response: ${catResponse.status} ${catResponse.statusText}`);
    
    if (catResponse.ok) {
      const catData = await catResponse.json();
      console.log(`✅ Categories API works: ${catData.categories?.length || 0} categories`);
    } else {
      const catErrorText = await catResponse.text();
      console.error('❌ Categories API failed:', catErrorText);
    }

  } catch (error) {
    console.error('❌ HTTP test failed:', error.message);
    console.log('💡 Make sure the server is running: npm start');
  }
}

if (require.main === module) {
  testHTTPAPI();
}