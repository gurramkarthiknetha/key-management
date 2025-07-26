const mongoose = require('mongoose');
require('dotenv').config();

// Department Schema
const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
  },
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);

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

async function seedDepartments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('Cleared existing departments');

    // Insert new departments
    const insertedDepartments = await Department.insertMany(departments);
    console.log(`Inserted ${insertedDepartments.length} departments`);

    console.log('Departments seeded successfully:');
    insertedDepartments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.code})`);
    });

  } catch (error) {
    console.error('Error seeding departments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDepartments();
