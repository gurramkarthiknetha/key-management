require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Define schemas
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
  requestReason: { type: String }
}, { timestamps: true });

const keyTransactionSchema = new mongoose.Schema({
  keyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Key', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['collected', 'returned', 'shared'], required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
  notes: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Key = mongoose.models.Key || mongoose.model('Key', keySchema);
const KeyAssignment = mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', keyAssignmentSchema);
const KeyTransaction = mongoose.models.KeyTransaction || mongoose.model('KeyTransaction', keyTransactionSchema);

async function assignKeysToPuli() {
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

    console.log(`👤 Found user: ${user.name} (${user._id})`);
    console.log(`🏢 Department: ${user.department}`);

    // Check existing assignments
    const existingAssignments = await KeyAssignment.find({ facultyId: user._id });
    console.log(`📋 Existing assignments: ${existingAssignments.length}`);

    // Get some keys to assign
    const availableKeys = await Key.find({ isActive: true }).limit(5);
    console.log(`🔑 Available keys: ${availableKeys.length}`);

    // Create new assignments for this user
    const keysToAssign = [
      { name: 'Computer Lab 1 Master Key', accessType: 'permanent', daysFromNow: 7 },
      { name: 'Software Engineering Lab Key', accessType: 'temporary', daysFromNow: 3 },
      { name: 'Database Lab Key', accessType: 'temporary', daysFromNow: -1 }, // overdue
      { name: 'Network Security Lab', accessType: 'temporary', daysFromNow: 5 }
    ];

    console.log('\n🔄 Creating new assignments...');

    for (const keyInfo of keysToAssign) {
      // Find the key
      const key = await Key.findOne({ name: keyInfo.name });
      if (!key) {
        console.log(`⚠️  Key not found: ${keyInfo.name}`);
        continue;
      }

      // Check if assignment already exists for this user and key
      const existingAssignment = await KeyAssignment.findOne({
        keyId: key._id,
        facultyId: user._id
      });

      if (existingAssignment) {
        console.log(`⚠️  Assignment already exists for ${keyInfo.name}`);
        continue;
      }

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + keyInfo.daysFromNow);

      // Determine status
      const status = keyInfo.daysFromNow < 0 ? 'overdue' : 'active';

      // Create assignment
      const assignment = new KeyAssignment({
        keyId: key._id,
        facultyId: user._id,
        accessType: keyInfo.accessType,
        status: status,
        assignedDate: new Date(),
        dueDate: dueDate,
        requestReason: 'Mock assignment for testing'
      });

      await assignment.save();
      console.log(`✅ Created assignment: ${keyInfo.name} - Status: ${status}`);

      // Create transaction log
      const transaction = new KeyTransaction({
        keyId: key._id,
        facultyId: user._id,
        action: 'collected',
        timestamp: new Date(),
        location: 'Security Office',
        notes: 'Mock transaction for testing'
      });

      await transaction.save();
      console.log(`📝 Transaction logged: collected for key ${key._id}`);
    }

    // Final summary
    const finalAssignments = await KeyAssignment.find({ facultyId: user._id });
    const activeCount = await KeyAssignment.countDocuments({ 
      facultyId: user._id, 
      status: 'active' 
    });
    const overdueCount = await KeyAssignment.countDocuments({ 
      facultyId: user._id, 
      status: 'overdue' 
    });

    console.log('\n📊 Final Summary:');
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🏢 Department: ${user.department}`);
    console.log(`🔑 Total keys assigned: ${finalAssignments.length}`);
    console.log(`📈 Active assignments: ${activeCount}`);
    console.log(`⚠️  Overdue assignments: ${overdueCount}`);

    console.log('\n🎉 Keys assigned successfully!');
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
  }
}

assignKeysToPuli();
