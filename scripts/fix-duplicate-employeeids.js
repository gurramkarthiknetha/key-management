const mongoose = require('mongoose');
require('dotenv').config();

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  employeeId: { type: String, sparse: true, trim: true, default: null },
  password: { type: String },
  role: { type: String, enum: ['faculty', 'security', 'security_incharge', 'hod'], required: true },
  department: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  googleId: { type: String, sparse: true },
  profileImage: { type: String },
  qrCode: { type: String }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixDuplicateEmployeeIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users with null or empty employeeId
    const usersWithNullEmployeeId = await User.find({
      $or: [
        { employeeId: null },
        { employeeId: '' },
        { employeeId: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithNullEmployeeId.length} users with null/empty employeeId`);

    // Update each user to have a unique employeeId or remove the field entirely
    for (let i = 0; i < usersWithNullEmployeeId.length; i++) {
      const user = usersWithNullEmployeeId[i];
      
      // For Google OAuth users, we'll remove the employeeId field entirely
      if (user.googleId) {
        await User.updateOne(
          { _id: user._id },
          { $unset: { employeeId: 1 } }
        );
        console.log(`Removed employeeId from Google OAuth user: ${user.email}`);
      } else {
        // For regular users, set a unique employeeId if they don't have one
        const uniqueEmployeeId = `EMP${Date.now()}${i}`;
        await User.updateOne(
          { _id: user._id },
          { $set: { employeeId: uniqueEmployeeId } }
        );
        console.log(`Set employeeId ${uniqueEmployeeId} for user: ${user.email}`);
      }
    }

    // Drop and recreate the employeeId index to ensure it's sparse
    try {
      await User.collection.dropIndex('employeeId_1');
      console.log('Dropped existing employeeId index');
    } catch (error) {
      console.log('No existing employeeId index to drop');
    }

    // Create sparse index for employeeId
    await User.collection.createIndex({ employeeId: 1 }, { sparse: true, unique: true });
    console.log('Created sparse unique index for employeeId');

    console.log('✅ Fixed duplicate employeeId issues');

  } catch (error) {
    console.error('❌ Error fixing duplicate employeeIds:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

fixDuplicateEmployeeIds();
