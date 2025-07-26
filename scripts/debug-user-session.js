require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define schemas directly
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  googleId: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const keySchema = new mongoose.Schema({
  name: { type: String, required: true },
  labName: { type: String, required: true },
  labNumber: { type: String, required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const keyAssignmentSchema = new mongoose.Schema({
  keyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Key', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessType: { type: String, enum: ['permanent', 'temporary'], default: 'temporary' },
  status: { type: String, enum: ['pending', 'active', 'overdue', 'returned'], default: 'pending' },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  requestReason: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Key = mongoose.models.Key || mongoose.model('Key', keySchema);
const KeyAssignment = mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', keyAssignmentSchema);

async function debugUserSession() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the user by email
    const userEmail = 'bhavishwareddy005@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log('👤 User found:');
    console.log(`  📧 Email: ${user.email}`);
    console.log(`  🆔 ID: ${user._id}`);
    console.log(`  👤 Name: ${user.name}`);
    console.log(`  🏢 Department: ${user.department}`);
    console.log(`  🎭 Role: ${user.role}`);

    // Check current key assignments for this user
    const assignments = await KeyAssignment.find({ facultyId: user._id })
      .populate('keyId', 'name labName labNumber')
      .sort({ createdAt: -1 });

    console.log(`\n🔑 Key assignments for this user (${assignments.length} found):`);
    if (assignments.length === 0) {
      console.log('  ❌ No key assignments found');
    } else {
      assignments.forEach((assignment, index) => {
        console.log(`  ${index + 1}. ${assignment.keyId.name} (${assignment.keyId.labName})`);
        console.log(`     Status: ${assignment.status}`);
        console.log(`     Access Type: ${assignment.accessType}`);
        console.log(`     Assigned: ${assignment.assignedDate}`);
        console.log(`     Due: ${assignment.dueDate || 'No due date'}`);
        console.log('');
      });
    }

    // Check if there are any assignments with email as facultyId (incorrect)
    const emailAssignments = await KeyAssignment.find({ facultyId: userEmail });
    console.log(`\n🔍 Checking for assignments with email as facultyId: ${emailAssignments.length} found`);
    
    if (emailAssignments.length > 0) {
      console.log('⚠️  Found assignments with email instead of ObjectId - these need to be fixed!');
      
      // Fix the assignments
      console.log('🔧 Fixing assignments...');
      for (const assignment of emailAssignments) {
        assignment.facultyId = user._id;
        await assignment.save();
        console.log(`✅ Fixed assignment: ${assignment._id}`);
      }
      console.log('🎉 All assignments fixed!');
    }

    await mongoose.disconnect();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

debugUserSession();
