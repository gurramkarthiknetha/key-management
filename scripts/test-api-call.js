require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define schemas to match the models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true }
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
  lastUsed: { type: Date }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Key = mongoose.models.Key || mongoose.model('Key', keySchema);
const KeyAssignment = mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', keyAssignmentSchema);

async function testApiCall() {
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

    console.log(`👤 Testing API call for user: ${user.name} (${user._id})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log(`🏢 Department: ${user.department}`);

    // Simulate the API call logic from /api/keys?type=my-keys
    console.log('\n🔍 Simulating API call: GET /api/keys?type=my-keys');
    
    const userId = user._id;
    console.log(`🆔 Using userId: ${userId}`);

    // Get keys assigned to the current user (same logic as in the API)
    const assignments = await KeyAssignment.find({ 
      facultyId: userId,
      status: { $in: ['active', 'overdue'] }
    }).populate('keyId');
    
    console.log(`📋 Found ${assignments.length} assignments`);

    if (assignments.length === 0) {
      console.log('❌ No assignments found with status "active" or "overdue"');
      
      // Check all assignments for this user
      const allAssignments = await KeyAssignment.find({ facultyId: userId }).populate('keyId');
      console.log(`📊 Total assignments for user: ${allAssignments.length}`);
      
      if (allAssignments.length > 0) {
        console.log('📝 All assignments:');
        allAssignments.forEach((assignment, index) => {
          console.log(`  ${index + 1}. ${assignment.keyId?.name || 'Unknown Key'}`);
          console.log(`     Status: ${assignment.status}`);
          console.log(`     Access Type: ${assignment.accessType}`);
          console.log('');
        });
      }
    } else {
      // Format the response like the API does
      const keys = assignments.map(assignment => ({
        id: assignment.keyId._id,
        keyName: assignment.keyId.name,
        labName: assignment.keyId.labName,
        labNumber: assignment.keyId.labNumber,
        accessType: assignment.accessType,
        status: assignment.status,
        assignedDate: assignment.assignedDate,
        dueDate: assignment.dueDate,
        lastUsed: assignment.lastUsed,
        isOverdue: assignment.status === 'overdue',
        qrCode: `QR_${assignment._id}_${Date.now()}`
      }));

      console.log('✅ API Response would be:');
      console.log(JSON.stringify({ keys }, null, 2));
    }

    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
  }
}

testApiCall();
