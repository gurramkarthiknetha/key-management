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

async function updateUserName() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const userEmail = '23071a7251@vnrvjiet.in';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log(`👤 Current user: ${user.name}`);
    
    // Update the user name
    user.name = 'PULI BHAVISHWA REDDY';
    await user.save();
    
    console.log(`✅ Updated user name to: ${user.name}`);

    await mongoose.disconnect();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

updateUserName();
