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
  },
  passwordResetRequired: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function fixUserSession() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const userEmail = '23071a7228@vnrvjiet.in';
    console.log(`🔍 Checking user: ${userEmail}`);

    // Check if user exists
    let user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found in database. Creating user...');
      
      // Create the user
      user = new User({
        email: userEmail,
        name: 'Faculty User', // You can update this later
        employeeId: userEmail.split('@')[0], // Use email prefix as employee ID
        role: 'faculty',
        department: 'General', // You can update this later
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await user.save();
      console.log('✅ User created successfully:', user._id);
    } else {
      console.log('✅ User found:', user._id);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Department:', user.department);
    }

    // Also check for any key assignments that might have email instead of ObjectId
    const KeyAssignmentSchema = new mongoose.Schema({
      keyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Key', required: true },
      facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      accessType: { type: String, enum: ['temporary', 'permanent'], default: 'temporary' },
      requestedDate: { type: Date, default: Date.now },
      approvedDate: { type: Date },
      returnDate: { type: Date },
      status: { type: String, enum: ['pending', 'approved', 'active', 'returned', 'overdue'], default: 'pending' },
      requestReason: { type: String },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String }
    }, { timestamps: true });

    const KeyAssignment = mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', KeyAssignmentSchema);

    // Check for assignments with email as facultyId (this would cause issues)
    // We need to use a raw query since the email string can't be cast to ObjectId
    try {
      const emailAssignments = await KeyAssignment.collection.find({ facultyId: userEmail }).toArray();
      console.log(`🔍 Checking for assignments with email as facultyId: ${emailAssignments.length} found`);

      if (emailAssignments.length > 0) {
        console.log('⚠️  Found assignments with email instead of ObjectId - fixing...');

        // Update all assignments with email to use the ObjectId
        const result = await KeyAssignment.collection.updateMany(
          { facultyId: userEmail },
          { $set: { facultyId: user._id } }
        );
        console.log(`✅ Fixed ${result.modifiedCount} assignments`);
      }
    } catch (error) {
      console.log('ℹ️  No assignments with email found (this is normal)');
    }

    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    console.log('✅ User session fix completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserSession();
