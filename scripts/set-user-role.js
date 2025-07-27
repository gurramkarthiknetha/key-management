require('dotenv').config();
const { setUserRole } = require('../lib/userRoles.js');

async function setRole() {
  try {
    const userEmail = '23071a7228@vnrvjiet.in';
    const role = 'faculty';
    
    console.log(`🔧 Setting role for ${userEmail} to ${role}`);
    
    // Set the role using the userRoles system
    setUserRole(userEmail, role, 'script');
    
    console.log('✅ Role set successfully!');
    
  } catch (error) {
    console.error('❌ Error setting role:', error);
    process.exit(1);
  }
}

setRole();
