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

const keyAssignmentSchema = new mongoose.Schema({
  keyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Key', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessType: { type: String, enum: ['permanent', 'temporary'], default: 'temporary' },
  status: { type: String, enum: ['pending', 'active', 'overdue', 'returned'], default: 'pending' },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const KeyAssignment = mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', keyAssignmentSchema);

async function fixAssignments() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const userEmail = 'bhavishwareddy005@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user._id})`);

    // Find assignments where facultyId is a string (email) instead of ObjectId
    console.log('🔍 Looking for assignments with email as facultyId...');
    
    // Use raw MongoDB query to find string facultyIds
    const db = mongoose.connection.db;
    const collection = db.collection('keyassignments');
    
    const stringAssignments = await collection.find({
      facultyId: { $type: "string" }
    }).toArray();

    console.log(`📋 Found ${stringAssignments.length} assignments with string facultyId`);

    if (stringAssignments.length > 0) {
      console.log('🔧 Fixing assignments...');
      
      for (const assignment of stringAssignments) {
        if (assignment.facultyId === userEmail) {
          console.log(`  ✅ Fixing assignment ${assignment._id}`);
          await collection.updateOne(
            { _id: assignment._id },
            { $set: { facultyId: new mongoose.Types.ObjectId(user._id) } }
          );
        } else {
          console.log(`  ⚠️  Skipping assignment ${assignment._id} - different email: ${assignment.facultyId}`);
        }
      }
      
      console.log('🎉 All assignments fixed!');
    } else {
      console.log('✅ No assignments need fixing');
    }

    // Verify the fix
    const userAssignments = await KeyAssignment.find({ facultyId: user._id });
    console.log(`\n🔑 User now has ${userAssignments.length} key assignments`);

    await mongoose.disconnect();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

fixAssignments();
