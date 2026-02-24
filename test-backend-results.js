// Quick test script to debug the results endpoint
// Run with: node test-backend-results.js

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/v1';

async function testResults() {
    try {
        // First, get list of elections
        console.log('📋 Fetching elections list...');
        const electionsResponse = await fetch(`${API_BASE}/voting`);
        const elections = await electionsResponse.json();
        
        console.log(`✅ Found ${elections.length} elections`);
        
        // Find a completed election
        const completedElection = elections.find(e => 
            e.status === 'completed' || new Date(e.end_date) < new Date()
        );
        
        if (!completedElection) {
            console.log('⚠️ No completed elections found');
            return;
        }
        
        console.log(`\n📊 Testing results for: ${completedElection.title}`);
        console.log(`   ID: ${completedElection.id}`);
        console.log(`   Status: ${completedElection.status}`);
        console.log(`   End Date: ${completedElection.end_date}`);
        
        // Fetch results
        console.log(`\n📡 Fetching results from: ${API_BASE}/voting/${completedElection.id}/results`);
        const resultsResponse = await fetch(`${API_BASE}/voting/${completedElection.id}/results`);
        
        console.log(`📡 Response status: ${resultsResponse.status}`);
        console.log(`📡 Response headers:`, resultsResponse.headers.raw());
        
        const resultsText = await resultsResponse.text();
        console.log(`📡 Response body (raw):`, resultsText);
        
        if (!resultsResponse.ok) {
            console.error(`❌ Error response: ${resultsResponse.status}`);
            try {
                const errorData = JSON.parse(resultsText);
                console.error('Error details:', errorData);
            } catch (e) {
                console.error('Could not parse error as JSON');
            }
            return;
        }
        
        const results = JSON.parse(resultsText);
        console.log(`\n✅ Results received: ${results.length} records`);
        
        if (results.length > 0) {
            console.log('\n📊 Sample results:');
            results.slice(0, 3).forEach(r => {
                console.log(`   ${r.position_title}: ${r.candidate_name} - ${r.vote_count} votes (${r.vote_percentage}%)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testResults();
