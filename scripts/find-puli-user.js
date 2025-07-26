require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function findPuliUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Search for users with "PULI" or "BHAVISHWA" in their name
    console.log('🔍 Searching for users with "PULI" or "BHAVISHWA" in name...');
    
    const puliUsers = await User.find({
      $or: [
        { name: { $regex: /PULI/i } },
        { name: { $regex: /BHAVISHWA/i } },
        { name: { $regex: /REDDY/i } }
      ]
    });

    console.log(`📋 Found ${puliUsers.length} matching users:`);
    
    if (puliUsers.length === 0) {
      console.log('❌ No users found with PULI, BHAVISHWA, or REDDY in name');
      
      // Show all users
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({});
      allUsers.forEach(user => {
        console.log(`  📧 ${user.email} - ${user.name} (${user.role})`);
      });
    } else {
      puliUsers.forEach(user => {
        console.log(`  📧 ${user.email} - ${user.name} (${user.role})`);
        console.log(`     🆔 ID: ${user._id}`);
        console.log(`     🏢 Department: ${user.department}`);
        console.log('');
      });
    }

    // Also check if there might be a user with a different email pattern
    console.log('\n🔍 Checking for users with vnrvjiet.in domain...');
    const vnrUsers = await User.find({ email: { $regex: /@vnrvjiet\.in$/i } });
    
    console.log(`📋 Found ${vnrUsers.length} users with vnrvjiet.in email:`);
    vnrUsers.forEach(user => {
      console.log(`  📧 ${user.email} - ${user.name} (${user.role})`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

findPuliUser();
