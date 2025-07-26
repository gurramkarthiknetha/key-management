// This script helps identify the current user session
// Since we can't directly access browser session from Node.js,
// let's create keys for common email patterns

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define User schema directly since the model uses ES6 imports
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['faculty', 'hod', 'security', 'security_head', 'admin'],
    default: 'faculty'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vnr-keys';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');

    // Find all users in the database
    const users = await User.find({}).select('email name role department');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log('📋 Users in database:');
      users.forEach(user => {
        console.log(`  📧 ${user.email} - ${user.name} (${user.role})`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
