const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

const testUsers = [
  { userId: 'faculty001', password: 'password123', role: 'faculty' },
  { userId: 'security001', password: 'password123', role: 'security' },
  { userId: 'sechead001', password: 'password123', role: 'security-head' }
];

async function createTestUsers() {
  console.log('👥 Creating test users for the application...\n');

  for (const user of testUsers) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, user);
      console.log(`✅ Created ${user.role} user: ${user.userId}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  User ${user.userId} already exists`);
      } else {
        console.log(`❌ Failed to create ${user.userId}:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n🎉 Test users setup complete!');
  console.log('\n📋 You can now login with these credentials:');
  console.log('');
  console.log('👨‍🏫 Faculty User:');
  console.log('   User ID: faculty001');
  console.log('   Password: password123');
  console.log('   Access: View assigned keys');
  console.log('');
  console.log('👮 Security User:');
  console.log('   User ID: security001');
  console.log('   Password: password123');
  console.log('   Access: Manage all keys, assign/return keys');
  console.log('');
  console.log('👨‍💼 Security Head User:');
  console.log('   User ID: sechead001');
  console.log('   Password: password123');
  console.log('   Access: Full system access, create/delete keys');
  console.log('');
  console.log('🌐 Visit http://localhost:3000 to start using the application!');
}

createTestUsers();
