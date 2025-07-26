const { getUserRole, getAllUserRoles } = require('../lib/userRoles');

console.log('🔍 Checking all users with roles...\n');

// Get all users with roles
const allUsers = getAllUserRoles();

if (Object.keys(allUsers).length === 0) {
  console.log('❌ No users found with roles');
} else {
  console.log('📋 Users with roles:');
  Object.entries(allUsers).forEach(([email, role]) => {
    console.log(`  📧 ${email} -> ${role}`);
  });
}

console.log('\n💡 To assign keys to a specific user, run:');
console.log('node add-mock-keys.js <email>');
console.log('\nExample:');
console.log('node add-mock-keys.js your-email@vnrvjiet.in');
