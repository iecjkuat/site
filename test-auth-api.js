// Simple test script to verify authentication API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAuthEndpoints() {
    console.log('🧪 Testing Authentication API Endpoints...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server health...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Server health:', healthData.status);
        console.log('   Database:', healthData.database);
        console.log('');

        // Test 2: Check sample users
        console.log('2. Checking sample users...');
        const usersResponse = await fetch(`${BASE_URL}/api/auth/test-users`);
        const usersData = await usersResponse.json();
        console.log('✅ Sample users found:', usersData.count);
        usersData.users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        console.log('');

        // Test 3: Fix passwords if needed
        console.log('3. Fixing sample user passwords...');
        const fixResponse = await fetch(`${BASE_URL}/api/auth/test-users?fix=true`);
        const fixData = await fixResponse.json();
        console.log('✅ Password fix result:', fixData.message);
        console.log('');

        // Test 4: Test login with sample user
        console.log('4. Testing login with admin user...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: 'admin@jkuatinnovation.ac.ke',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('   User:', loginData.user.name);
            console.log('   Role:', loginData.user.role);
            console.log('   Token received:', !!loginData.token);
            
            // Test 5: Verify token
            console.log('\n5. Testing token verification...');
            const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
                console.log('✅ Token verification successful!');
                console.log('   Verified user:', verifyData.user.name);
            } else {
                console.log('❌ Token verification failed:', verifyData.message);
            }
            
        } else {
            console.log('❌ Login failed:', loginData.message);
            if (loginData.requiresVerification) {
                console.log('   Email verification required for:', loginData.email);
            }
        }

        console.log('\n🎉 Authentication API test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running: npm start or node server.js');
    }
}

// Run the test
testAuthEndpoints();