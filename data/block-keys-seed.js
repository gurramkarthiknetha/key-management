// Block-wise Keys Seed Data
// This file contains seed data for 300 lab keys distributed across 6 blocks
// 50 keys per block: A Block, B Block, C Block, D Block, PG Block, E Block

const blockKeysData = {
  // A Block - Computer Science and Information Technology Labs
  'A_BLOCK': {
    building: 'A Block',
    departments: ['Computer Science', 'Information Technology'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    keys: []
  },
  
  // B Block - Electronics and Communication Labs
  'B_BLOCK': {
    building: 'B Block', 
    departments: ['Electronics', 'Information Technology'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    keys: []
  },
  
  // C Block - Mechanical and Civil Engineering Labs
  'C_BLOCK': {
    building: 'C Block',
    departments: ['Mechanical', 'Civil'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    keys: []
  },
  
  // D Block - Chemical and General Purpose Labs
  'D_BLOCK': {
    building: 'D Block',
    departments: ['Chemical', 'Physics', 'Chemistry'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    keys: []
  },
  
  // PG Block - Postgraduate and Research Labs
  'PG_BLOCK': {
    building: 'PG Block',
    departments: ['Computer Science', 'Electronics', 'Mechanical'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor'],
    keys: []
  },
  
  // E Block - Mathematics and General Studies
  'E_BLOCK': {
    building: 'E Block',
    departments: ['Mathematics', 'Physics', 'Chemistry'],
    floors: ['Ground Floor', '1st Floor', '2nd Floor'],
    keys: []
  }
};

// Lab types for different departments
const labTypes = {
  'Computer Science': [
    'Programming Lab', 'Software Engineering Lab', 'Database Lab', 'Network Lab',
    'AI/ML Lab', 'Cybersecurity Lab', 'Web Development Lab', 'Mobile App Lab',
    'Data Structures Lab', 'Operating Systems Lab', 'Computer Graphics Lab', 'IoT Lab'
  ],
  'Information Technology': [
    'IT Lab', 'Network Administration Lab', 'System Administration Lab', 'Cloud Computing Lab',
    'DevOps Lab', 'IT Security Lab', 'Enterprise Systems Lab', 'Digital Forensics Lab'
  ],
  'Electronics': [
    'Digital Electronics Lab', 'Analog Electronics Lab', 'Microprocessor Lab', 'VLSI Lab',
    'Communication Systems Lab', 'Signal Processing Lab', 'Embedded Systems Lab', 'PCB Design Lab'
  ],
  'Mechanical': [
    'Manufacturing Lab', 'CAD/CAM Lab', 'Thermal Engineering Lab', 'Fluid Mechanics Lab',
    'Materials Testing Lab', 'Robotics Lab', 'Automation Lab', 'Design Lab'
  ],
  'Civil': [
    'Structural Engineering Lab', 'Geotechnical Lab', 'Transportation Lab', 'Environmental Lab',
    'Surveying Lab', 'Concrete Technology Lab', 'Highway Engineering Lab', 'Water Resources Lab'
  ],
  'Chemical': [
    'Process Engineering Lab', 'Chemical Reaction Lab', 'Unit Operations Lab', 'Instrumentation Lab',
    'Process Control Lab', 'Safety Engineering Lab', 'Environmental Engineering Lab', 'Petrochemical Lab'
  ],
  'Physics': [
    'Physics Lab', 'Optics Lab', 'Quantum Physics Lab', 'Solid State Physics Lab',
    'Nuclear Physics Lab', 'Laser Lab', 'Spectroscopy Lab', 'Materials Physics Lab'
  ],
  'Chemistry': [
    'Organic Chemistry Lab', 'Inorganic Chemistry Lab', 'Physical Chemistry Lab', 'Analytical Chemistry Lab',
    'Biochemistry Lab', 'Polymer Chemistry Lab', 'Environmental Chemistry Lab', 'Industrial Chemistry Lab'
  ],
  'Mathematics': [
    'Mathematics Lab', 'Statistics Lab', 'Computational Mathematics Lab', 'Applied Mathematics Lab',
    'Mathematical Modeling Lab', 'Numerical Analysis Lab', 'Operations Research Lab', 'Discrete Mathematics Lab'
  ]
};

// Function to generate keys for a specific block
function generateBlockKeys(blockCode, blockData) {
  const keys = [];
  const { building, departments, floors } = blockData;
  
  let keyCounter = 1;
  
  // Distribute 50 keys across departments and floors
  const keysPerDepartment = Math.floor(50 / departments.length);
  const remainingKeys = 50 % departments.length;
  
  departments.forEach((department, deptIndex) => {
    const departmentLabTypes = labTypes[department] || ['General Lab'];
    let keysForThisDept = keysPerDepartment;
    
    // Add remaining keys to first departments
    if (deptIndex < remainingKeys) {
      keysForThisDept += 1;
    }
    
    for (let i = 0; i < keysForThisDept; i++) {
      const floor = floors[i % floors.length];
      const labType = departmentLabTypes[i % departmentLabTypes.length];
      const roomNumber = `${blockCode.charAt(0)}${Math.floor(i / floors.length) + 1}${String(keyCounter).padStart(2, '0')}`;
      
      const key = {
        name: `${labType} Key`,
        labName: labType,
        labNumber: roomNumber,
        department: department,
        description: `${labType} located in ${building}, ${floor}`,
        keyType: 'lab',
        location: {
          building: building,
          floor: floor,
          room: roomNumber
        },
        requiresApproval: i % 3 === 0, // Every 3rd key requires approval
        maxAssignmentDuration: [24, 48, 72][i % 3], // Rotate between 24, 48, 72 hours
        currentStatus: 'available',
        isActive: true
      };
      
      keys.push(key);
      keyCounter++;
    }
  });
  
  return keys;
}

// Generate all keys for all blocks
Object.keys(blockKeysData).forEach(blockCode => {
  blockKeysData[blockCode].keys = generateBlockKeys(blockCode, blockKeysData[blockCode]);
});

// Export the complete seed data
export default blockKeysData;

// Export individual block data for selective imports
export const aBlockKeys = blockKeysData.A_BLOCK.keys;
export const bBlockKeys = blockKeysData.B_BLOCK.keys;
export const cBlockKeys = blockKeysData.C_BLOCK.keys;
export const dBlockKeys = blockKeysData.D_BLOCK.keys;
export const pgBlockKeys = blockKeysData.PG_BLOCK.keys;
export const eBlockKeys = blockKeysData.E_BLOCK.keys;

// Export summary information
export const blockSummary = {
  totalBlocks: Object.keys(blockKeysData).length,
  totalKeys: Object.values(blockKeysData).reduce((sum, block) => sum + block.keys.length, 0),
  keysByBlock: Object.fromEntries(
    Object.entries(blockKeysData).map(([blockCode, blockData]) => [
      blockCode, 
      {
        count: blockData.keys.length,
        building: blockData.building,
        departments: blockData.departments
      }
    ])
  )
};
