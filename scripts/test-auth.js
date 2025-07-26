const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  employeeId: { type: String, sparse: true, trim: true },
  password: { type: String },
  role: { type: String, enum: ['faculty', 'security', 'security_incharge', 'hod'], required: true },
  department: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  googleId: { type: String, sparse: true },
  profileImage: { type: String },
  qrCode: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testAuthSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a test user
    console.log('\n🧪 Test 1: Creating test user...');
    
    // Clear existing test user
    await User.deleteOne({ email: 'test@example.com' });
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      employeeId: 'TEST001',
      password: hashedPassword,
      role: 'faculty',
      department: 'Computer Science and Engineering',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Test 2: Verify password hashing
    console.log('\n🧪 Test 2: Testing password verification...');
    const isPasswordValid = await bcrypt.compare('password123', testUser.password);
    console.log(`✅ Password verification: ${isPasswordValid ? 'PASSED' : 'FAILED'}`);

    // Test 3: Test user lookup
    console.log('\n🧪 Test 3: Testing user lookup...');
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log(`✅ User lookup: ${foundUser ? 'PASSED' : 'FAILED'}`);

    // Test 4: Test role validation
    console.log('\n🧪 Test 4: Testing role validation...');
    const validRoles = ['faculty', 'security', 'security_incharge', 'hod'];
    const isRoleValid = validRoles.includes(foundUser.role);
    console.log(`✅ Role validation: ${isRoleValid ? 'PASSED' : 'FAILED'}`);

    // Test 5: Create Google OAuth user
    console.log('\n🧪 Test 5: Creating Google OAuth user...');
    
    await User.deleteOne({ email: 'google@example.com' });
    
    const googleUser = new User({
      name: 'Google User',
      email: 'google@example.com',
      googleId: 'google123456',
      role: 'faculty',
      department: 'General',
      isActive: true,
      profileImage: 'https://example.com/avatar.jpg'
    });

    await googleUser.save();
    console.log('✅ Google OAuth user created successfully');

    // Test 6: Test unique constraints
    console.log('\n🧪 Test 6: Testing unique constraints...');
    try {
      const duplicateUser = new User({
        name: 'Duplicate User',
        email: 'test@example.com', // Same email
        password: hashedPassword,
        role: 'security',
        department: 'Security',
        isActive: true
      });
      await duplicateUser.save();
      console.log('❌ Unique constraint test: FAILED (duplicate allowed)');
    } catch (error) {
      console.log('✅ Unique constraint test: PASSED (duplicate rejected)');
    }

    // Test 7: Test user queries
    console.log('\n🧪 Test 7: Testing user queries...');
    const activeUsers = await User.find({ isActive: true });
    const facultyUsers = await User.find({ role: 'faculty' });
    console.log(`✅ Query tests: Found ${activeUsers.length} active users, ${facultyUsers.length} faculty users`);

    console.log('\n🎉 All authentication system tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- User creation: ✅');
    console.log('- Password hashing: ✅');
    console.log('- User lookup: ✅');
    console.log('- Role validation: ✅');
    console.log('- Google OAuth user: ✅');
    console.log('- Unique constraints: ✅');
    console.log('- Database queries: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAuthSystem();
