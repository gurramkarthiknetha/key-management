require('dotenv').config();
const mongoose = require('mongoose');

// Define User schema
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
  password: {
    type: String,
    default: null
  },
  profileImage: {
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

function getDepartmentFromEmail(email) {
  // Extract department from email domain or use default
  if (email.includes('@vnrvjiet.in')) {
    return 'Computer Science and Engineering'; // Default department for VNR
  }
  return 'General';
}

async function createMissingUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = '23071a7229@vnrvjiet.in';
    
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`✅ User already exists: ${email}`);
      console.log('User details:', {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        department: existingUser.department,
        employeeId: existingUser.employeeId
      });
      return;
    }

    // Create new user
    console.log(`👤 Creating new user: ${email}`);
    
    const newUser = new User({
      email: email,
      name: email.split('@')[0], // Use email prefix as name
      employeeId: email.split('@')[0], // Use email prefix as employee ID
      role: 'faculty',
      department: getDepartmentFromEmail(email),
      googleId: null, // Will be set during OAuth
      image: null,
      isActive: true,
      lastLogin: new Date()
    });
    
    await newUser.save();
    console.log(`✅ User created successfully: ${email}`);
    console.log('User details:', {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      employeeId: newUser.employeeId
    });

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createMissingUser();
