// Test script to verify comment like and reply endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/v1';

// You'll need to replace these with actual values from your database
const TEST_IDEA_ID = 'YOUR_IDEA_ID_HERE';
const TEST_COMMENT_ID = 'YOUR_COMMENT_ID_HERE';
const TEST_TOKEN = 'YOUR_AUTH_TOKEN_HERE';

async function testLikeEndpoint() {
    console.log('\n=== Testing Like Endpoint ===');
    const url = `${BASE_URL}/ideas/${TEST_IDEA_ID}/comments/${TEST_COMMENT_ID}/like`;
    console.log('URL:', url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const text = await response.text();
        console.log('Response:', text);
        
        if (response.ok) {
            console.log('✅ Like endpoint works!');
        } else {
            console.log('❌ Like endpoint failed');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testReplyEndpoint() {
    console.log('\n=== Testing Reply Endpoint ===');
    const url = `${BASE_URL}/ideas/${TEST_IDEA_ID}/comments/${TEST_COMMENT_ID}/reply`;
    console.log('URL:', url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Test reply'
            })
        });
        
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const text = await response.text();
        console.log('Response:', text);
        
        if (response.ok) {
            console.log('✅ Reply endpoint works!');
        } else {
            console.log('❌ Reply endpoint failed');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testGetComments() {
    console.log('\n=== Testing Get Comments Endpoint ===');
    const url = `${BASE_URL}/ideas/${TEST_IDEA_ID}/comments`;
    console.log('URL:', url);
    
    try {
        const response = await fetch(url);
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Comments:', JSON.stringify(data, null, 2));
        
        if (data.comments && data.comments.length > 0) {
            console.log('\n📝 Available comment IDs:');
            data.comments.forEach(c => {
                console.log(`  - ${c.id} by ${c.user?.name || 'Unknown'}`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testGetIdeas() {
    console.log('\n=== Testing Get Ideas Endpoint ===');
    const url = `${BASE_URL}/ideas?limit=5`;
    console.log('URL:', url);
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ideas && data.ideas.length > 0) {
            console.log('\n💡 Available idea IDs:');
            data.ideas.forEach(i => {
                console.log(`  - ${i.id}: ${i.title}`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🧪 Comment Endpoints Test Suite');
    console.log('================================');
    
    // First get available IDs
    await testGetIdeas();
    
    if (TEST_IDEA_ID !== 'YOUR_IDEA_ID_HERE') {
        await testGetComments();
        await testLikeEndpoint();
        await testReplyEndpoint();
    } else {
        console.log('\n⚠️  Please update TEST_IDEA_ID, TEST_COMMENT_ID, and TEST_TOKEN in the script');
    }
}

runTests();
