import mongoose from 'mongoose';
import User from '../models/User.js';
import Key from '../models/Key.js';
import KeyAssignment from '../models/KeyAssignment.js';
import KeyTransaction from '../models/KeyTransaction.js';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '../.env' });

// Direct MongoDB connection function
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  console.log('🔗 Connecting to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// You can change this email to match your current logged-in user
const USER_EMAIL = process.argv[2] || '23071a7251@vnrvjiet.in';

console.log(`🎯 Target user email: ${USER_EMAIL}`);

// Mock keys data
const mockKeys = [
  {
    name: 'Computer Lab 1 Master Key',
    labName: 'Computer Lab 1',
    labNumber: 'CS-101',
    department: 'Computer Science',
    keyType: 'lab',
    location: {
      building: 'Main Block',
      floor: '1st Floor',
      room: 'CS-101'
    },
    description: 'Master key for Computer Science Lab 1 with 50 systems',
    requiresApproval: false,
    maxAssignmentDuration: 48
  },
  {
    name: 'Software Engineering Lab Key',
    labName: 'Software Engineering Lab',
    labNumber: 'CS-201',
    department: 'Computer Science',
    keyType: 'lab',
    location: {
      building: 'Main Block',
      floor: '2nd Floor',
      room: 'CS-201'
    },
    description: 'Key for Software Engineering Lab with advanced development tools',
    requiresApproval: true,
    maxAssignmentDuration: 24
  },
  {
    name: 'Database Lab Key',
    labName: 'Database Management Lab',
    labNumber: 'CS-301',
    department: 'Computer Science',
    keyType: 'lab',
    location: {
      building: 'IT Block',
      floor: '3rd Floor',
      room: 'CS-301'
    },
    description: 'Database lab with Oracle and MySQL servers',
    requiresApproval: false,
    maxAssignmentDuration: 36
  },
  {
    name: 'Network Security Lab',
    labName: 'Cybersecurity Lab',
    labNumber: 'CS-401',
    department: 'Computer Science',
    keyType: 'lab',
    location: {
      building: 'IT Block',
      floor: '4th Floor',
      room: 'CS-401'
    },
    description: 'Advanced cybersecurity lab with penetration testing tools',
    requiresApproval: true,
    maxAssignmentDuration: 24
  },
  {
    name: 'Faculty Office Key',
    labName: 'CS Faculty Office',
    labNumber: 'CS-OFF-15',
    department: 'Computer Science',
    keyType: 'office',
    location: {
      building: 'Faculty Block',
      floor: '1st Floor',
      room: 'CS-OFF-15'
    },
    description: 'Personal faculty office key',
    requiresApproval: false,
    maxAssignmentDuration: 168 // 1 week
  },
  {
    name: 'Equipment Storage Key',
    labName: 'CS Equipment Storage',
    labNumber: 'CS-STORE-01',
    department: 'Computer Science',
    keyType: 'storage',
    location: {
      building: 'Main Block',
      floor: 'Ground Floor',
      room: 'CS-STORE-01'
    },
    description: 'Storage room for computer equipment and accessories',
    requiresApproval: true,
    maxAssignmentDuration: 12
  }
];

async function addMockKeysToUser() {
  try {
    console.log('🔄 Connecting to database...');
    console.log('📍 MONGODB_URI:', process.env.MONGODB_URI);
    await connectDB();

    // Check existing indexes on keys collection
    console.log('🔍 Checking indexes on keys collection...');
    const indexes = await mongoose.connection.db.collection('keys').indexes();
    console.log('📋 Existing indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the problematic keyId index if it exists
    const hasKeyIdIndex = indexes.some(idx => idx.name === 'keyId_1');
    if (hasKeyIdIndex) {
      console.log('🗑️  Dropping problematic keyId_1 index...');
      try {
        await mongoose.connection.db.collection('keys').dropIndex('keyId_1');
        console.log('✅ Successfully dropped keyId_1 index');
      } catch (dropError) {
        console.log('⚠️  Could not drop keyId_1 index:', dropError.message);
      }
    }
    
    // Find the user
    console.log(`🔍 Finding user with email: ${USER_EMAIL}`);
    let user = await User.findOne({ email: USER_EMAIL });

    if (!user) {
      console.log(`⚠️  User with email ${USER_EMAIL} not found. Creating user...`);

      // Create the user
      user = new User({
        email: USER_EMAIL,
        name: 'Test User',
        employeeId: '23071A7251',
        role: 'faculty',
        department: 'Computer Science',
        isActive: true
      });

      await user.save();
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }
    
    console.log(`✅ Found user: ${user.name} (${user.role}) - Department: ${user.department}`);
    
    // Find or create a security head user to assign keys (required for createdBy field)
    let securityHead = await User.findOne({ role: 'security_head' });
    if (!securityHead) {
      console.log('🔄 Creating mock security head user...');
      securityHead = new User({
        email: 'security.head@vnrvjiet.in',
        name: 'Security Head',
        employeeId: 'SEC001',
        role: 'security_head',
        department: 'Administration',
        isActive: true
      });
      await securityHead.save();
      console.log('✅ Created security head user');
    }
    
    console.log('🔄 Creating mock keys and assignments...');
    
    const createdKeys = [];
    const createdAssignments = [];
    
    for (let i = 0; i < mockKeys.length; i++) {
      const keyData = mockKeys[i];
      
      // Check if key already exists
      const existingKey = await Key.findOne({ 
        labNumber: keyData.labNumber, 
        department: keyData.department 
      });
      
      let key;
      if (existingKey) {
        console.log(`⚠️  Key ${keyData.labNumber} already exists, using existing key`);
        key = existingKey;
      } else {
        // Create the key
        try {
          key = new Key({
            ...keyData,
            createdBy: securityHead._id,
            currentStatus: i < 4 ? 'assigned' : 'available' // First 4 keys will be assigned
          });

          await key.save();
          createdKeys.push(key);
          console.log(`✅ Created key: ${key.name} (${key.labNumber})`);
        } catch (keyError) {
          console.log(`❌ Error creating key ${keyData.labNumber}: ${keyError.message}`);
          continue; // Skip this key and continue with the next one
        }
      }
      
      // Create assignments for the first 4 keys (mix of active and overdue)
      if (i < 4) {
        const assignmentStatuses = ['active', 'active', 'overdue', 'active'];
        const dueDates = [
          new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
          new Date(Date.now() + 48 * 60 * 60 * 1000), // Due in 2 days
          new Date(Date.now() - 12 * 60 * 60 * 1000), // Overdue by 12 hours
          new Date(Date.now() + 72 * 60 * 60 * 1000)  // Due in 3 days
        ];
        
        const assignedDates = [
          new Date(Date.now() - 12 * 60 * 60 * 1000), // Assigned 12 hours ago
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Assigned 1 day ago
          new Date(Date.now() - 36 * 60 * 60 * 1000), // Assigned 1.5 days ago
          new Date(Date.now() - 6 * 60 * 60 * 1000)   // Assigned 6 hours ago
        ];
        
        // Check if assignment already exists
        const existingAssignment = await KeyAssignment.findOne({
          keyId: key._id,
          facultyId: user._id,
          status: { $in: ['active', 'overdue', 'pending'] }
        });
        
        if (!existingAssignment) {
          const assignment = new KeyAssignment({
            keyId: key._id,
            facultyId: user._id,
            assignedBy: securityHead._id,
            assignedDate: assignedDates[i],
            dueDate: dueDates[i],
            accessType: i === 0 ? 'permanent' : 'temporary',
            status: assignmentStatuses[i],
            requestReason: `Mock assignment for ${keyData.name}`
          });
          
          await assignment.save();
          createdAssignments.push(assignment);

          // Create transaction record
          try {
            const transaction = new KeyTransaction({
              type: 'collected',
              keyId: key._id,
              facultyId: user._id,
              securityPersonnelId: securityHead._id,
              assignmentId: assignment._id,
              timestamp: assignedDates[i],
              details: `Mock key collection for ${keyData.name}`,
              status: 'completed'
            });

            await transaction.save();
            console.log(`📝 Transaction logged: collected for key ${key._id}`);
          } catch (transactionError) {
            console.log(`⚠️  Could not create transaction: ${transactionError.message}`);
          }

          console.log(`✅ Created assignment: ${key.name} - Status: ${assignment.status}`);
        } else {
          console.log(`⚠️  Assignment for ${key.name} already exists`);
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Keys created: ${createdKeys.length}`);
    console.log(`✅ Assignments created: ${createdAssignments.length}`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🏢 Department: ${user.department}`);
    console.log(`🔑 Total keys assigned: ${createdAssignments.length}`);
    
    const activeCount = createdAssignments.filter(a => a.status === 'active').length;
    const overdueCount = createdAssignments.filter(a => a.status === 'overdue').length;
    
    console.log(`📈 Active assignments: ${activeCount}`);
    console.log(`⚠️  Overdue assignments: ${overdueCount}`);
    
    console.log('\n🎉 Mock keys and assignments added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding mock keys:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addMockKeysToUser();
