const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function quickTest() {
  console.log('🧪 Quick Integration Test\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing registration...');
    const userId = `testuser${Date.now()}`;
    const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      userId,
      password: 'password123',
      role: 'faculty'
    });
    console.log('✅ Registration successful:', registerResponse.data.data.user.userId);
    
    const token = registerResponse.data.data.token;

    // Test 2: Test protected endpoint
    console.log('\n2. Testing protected endpoint...');
    const keysResponse = await axios.get(`${BACKEND_URL}/api/keys/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint accessible:', keysResponse.data.data.keys.length, 'keys found');

    // Test 3: Test login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      userId,
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.data.user.role);

    console.log('\n🎉 All tests passed! The backend is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- ✅ User registration working');
    console.log('- ✅ JWT authentication working');
    console.log('- ✅ Protected routes working');
    console.log('- ✅ Login working');
    console.log('\nYou can now use the frontend at http://localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

quickTest();
