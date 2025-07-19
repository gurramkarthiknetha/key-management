const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

async function testFrontendLogin() {
  console.log('🧪 Testing Frontend Login Integration\n');

  try {
    // Test 1: Check if frontend is accessible
    console.log('1. Checking frontend accessibility...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend is accessible');

    // Test 2: Check if login page is accessible
    console.log('\n2. Checking login page...');
    const loginPageResponse = await axios.get(`${FRONTEND_URL}/login`);
    console.log('✅ Login page is accessible');

    // Test 3: Test backend login directly
    console.log('\n3. Testing backend login directly...');
    const backendLoginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      userId: 'faculty001',
      password: 'password123'
    });
    console.log('✅ Backend login working:', backendLoginResponse.data.data.user.role);

    // Test 4: Check CORS
    console.log('\n4. Testing CORS...');
    try {
      const corsResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        userId: 'faculty001',
        password: 'password123'
      }, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ CORS is working correctly');
    } catch (corsError) {
      console.log('❌ CORS issue:', corsError.message);
    }

    console.log('\n📋 Debugging Tips:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Try logging in and check for any error messages');
    console.log('4. Go to Network tab to see if API calls are being made');
    console.log('\n🔍 Common Issues:');
    console.log('- Check if you\'re entering the correct User ID (not email)');
    console.log('- User ID should be: faculty001, security001, or sechead001');
    console.log('- Password should be: password123');
    console.log('- Make sure both servers are running');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection refused - check if servers are running:');
      console.log('- Backend: http://localhost:5000');
      console.log('- Frontend: http://localhost:3000');
    }
  }
}

testFrontendLogin();
