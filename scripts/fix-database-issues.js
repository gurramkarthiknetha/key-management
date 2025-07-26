const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabaseIssues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the entire users collection to start fresh
    try {
      await mongoose.connection.db.collection('users').drop();
      console.log('✅ Dropped users collection');
    } catch (error) {
      console.log('Users collection does not exist or already dropped');
    }

    // Drop the departments collection and recreate
    try {
      await mongoose.connection.db.collection('departments').drop();
      console.log('✅ Dropped departments collection');
    } catch (error) {
      console.log('Departments collection does not exist or already dropped');
    }

    // Recreate departments
    const departments = [
      { name: 'Computer Science and Engineering', code: 'CSE' },
      { name: 'Electronics and Communication Engineering', code: 'ECE' },
      { name: 'Mechanical Engineering', code: 'MECH' },
      { name: 'Civil Engineering', code: 'CIVIL' },
      { name: 'Electrical and Electronics Engineering', code: 'EEE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Chemical Engineering', code: 'CHEM_ENG' },
      { name: 'Biotechnology', code: 'BT' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' },
      { name: 'English', code: 'ENG' },
      { name: 'Management Studies', code: 'MBA' },
      { name: 'General', code: 'GEN' },
      { name: 'Administration', code: 'ADMIN' },
      { name: 'Security', code: 'SEC' }
    ];

    await mongoose.connection.db.collection('departments').insertMany(
      departments.map(dept => ({
        ...dept,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log('✅ Recreated departments collection');

    console.log('🎉 Database cleanup completed successfully!');
    console.log('You can now test Google OAuth authentication.');

  } catch (error) {
    console.error('❌ Error fixing database issues:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

fixDatabaseIssues();
