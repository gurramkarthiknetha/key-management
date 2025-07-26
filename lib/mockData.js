// Mock data for the key management system

// Mock keys data
export const mockKeys = [
  {
    id: 'KEY001',
    keyNumber: 'R101',
    location: 'Room 101 - Computer Lab',
    status: 'available',
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
    lastUpdated: '2024-01-15T10:30:00Z',
    notes: 'Main computer lab key'
  },
  {
    id: 'KEY002',
    keyNumber: 'R102',
    location: 'Room 102 - Physics Lab',
    status: 'issued',
    assignedTo: 'Dr. John Smith',
    assignedDate: '2024-01-10T09:00:00Z',
    returnDate: '2024-01-17T17:00:00Z',
    lastUpdated: '2024-01-10T09:00:00Z',
    notes: 'Physics lab equipment room'
  },
  {
    id: 'KEY003',
    keyNumber: 'R103',
    location: 'Room 103 - Chemistry Lab',
    status: 'issued',
    assignedTo: 'Prof. Sarah Johnson',
    assignedDate: '2024-01-08T08:30:00Z',
    returnDate: '2024-01-15T16:00:00Z',
    lastUpdated: '2024-01-08T08:30:00Z',
    notes: 'Chemistry lab with fume hoods'
  },
  {
    id: 'KEY004',
    keyNumber: 'R104',
    location: 'Room 104 - Biology Lab',
    status: 'lost',
    assignedTo: 'Dr. Mike Wilson',
    assignedDate: '2024-01-05T10:00:00Z',
    returnDate: '2024-01-12T15:00:00Z',
    lastUpdated: '2024-01-12T15:30:00Z',
    notes: 'Key reported lost, replacement needed'
  },
  {
    id: 'KEY005',
    keyNumber: 'R105',
    location: 'Room 105 - Conference Room',
    status: 'maintenance',
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
    lastUpdated: '2024-01-14T14:00:00Z',
    notes: 'Key mechanism needs repair'
  },
  {
    id: 'KEY006',
    keyNumber: 'R106',
    location: 'Room 106 - Library Study Room',
    status: 'available',
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
    lastUpdated: '2024-01-13T11:00:00Z',
    notes: 'Quiet study room'
  },
  {
    id: 'KEY007',
    keyNumber: 'R107',
    location: 'Room 107 - Faculty Lounge',
    status: 'issued',
    assignedTo: 'Dr. Emily Davis',
    assignedDate: '2024-01-12T07:45:00Z',
    returnDate: '2024-01-19T18:00:00Z',
    lastUpdated: '2024-01-12T07:45:00Z',
    notes: 'Faculty meeting room'
  },
  {
    id: 'KEY008',
    keyNumber: 'R108',
    location: 'Room 108 - Storage Room',
    status: 'damaged',
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
    lastUpdated: '2024-01-11T16:20:00Z',
    notes: 'Key bent, needs replacement'
  }
];

// Mock faculty data
export const mockFaculty = [
  {
    id: 'FAC001',
    name: 'Dr. John Smith',
    email: 'john.smith@vnrvjiet.in',
    department: 'Physics',
    phone: '+91-9876543210',
    status: 'active',
    joinDate: '2020-08-15',
    keysAssigned: ['KEY002'],
    totalKeysIssued: 15,
    overdueKeys: 0
  },
  {
    id: 'FAC002',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@vnrvjiet.in',
    department: 'Chemistry',
    phone: '+91-9876543211',
    status: 'active',
    joinDate: '2019-07-20',
    keysAssigned: ['KEY003'],
    totalKeysIssued: 22,
    overdueKeys: 1
  },
  {
    id: 'FAC003',
    name: 'Dr. Mike Wilson',
    email: 'mike.wilson@vnrvjiet.in',
    department: 'Biology',
    phone: '+91-9876543212',
    status: 'active',
    joinDate: '2021-01-10',
    keysAssigned: [],
    totalKeysIssued: 8,
    overdueKeys: 0
  },
  {
    id: 'FAC004',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@vnrvjiet.in',
    department: 'Computer Science',
    phone: '+91-9876543213',
    status: 'active',
    joinDate: '2018-09-05',
    keysAssigned: ['KEY007'],
    totalKeysIssued: 31,
    overdueKeys: 0
  },
  {
    id: 'FAC005',
    name: 'Prof. Robert Brown',
    email: 'robert.brown@vnrvjiet.in',
    department: 'Mathematics',
    phone: '+91-9876543214',
    status: 'inactive',
    joinDate: '2017-03-12',
    keysAssigned: [],
    totalKeysIssued: 5,
    overdueKeys: 0
  }
];

// Mock security personnel data
export const mockSecurityPersonnel = [
  {
    id: 'SEC001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@vnrvjiet.in',
    role: 'security_head',
    phone: '+91-9876543220',
    shift: 'day',
    status: 'active',
    joinDate: '2019-06-01',
    keysManaged: 45,
    lastLogin: '2024-01-15T08:00:00Z'
  },
  {
    id: 'SEC002',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@vnrvjiet.in',
    role: 'security',
    phone: '+91-9876543221',
    shift: 'night',
    status: 'active',
    joinDate: '2020-02-15',
    keysManaged: 32,
    lastLogin: '2024-01-14T20:00:00Z'
  },
  {
    id: 'SEC003',
    name: 'Venkat Rao',
    email: 'venkat.rao@vnrvjiet.in',
    role: 'security',
    phone: '+91-9876543222',
    shift: 'day',
    status: 'active',
    joinDate: '2021-04-10',
    keysManaged: 28,
    lastLogin: '2024-01-15T06:30:00Z'
  }
];

// Mock analytics data
export const mockAnalytics = {
  totalKeys: 150,
  availableKeys: 89,
  issuedKeys: 45,
  lostKeys: 8,
  damagedKeys: 5,
  maintenanceKeys: 3,
  overdueKeys: 12,
  totalFaculty: 85,
  activeFaculty: 78,
  totalSecurityPersonnel: 8,
  keyUtilizationRate: 67.3,
  averageKeyHoldTime: 4.2, // days
  monthlyStats: [
    { month: 'Jan', issued: 45, returned: 38, lost: 2, damaged: 1 },
    { month: 'Feb', issued: 52, returned: 47, lost: 1, damaged: 2 },
    { month: 'Mar', issued: 48, returned: 44, lost: 3, damaged: 1 },
    { month: 'Apr', issued: 41, returned: 39, lost: 1, damaged: 0 },
    { month: 'May', issued: 55, returned: 51, lost: 2, damaged: 1 },
    { month: 'Jun', issued: 38, returned: 35, lost: 1, damaged: 2 }
  ],
  departmentStats: [
    { department: 'Computer Science', keysIssued: 25, overdueKeys: 3 },
    { department: 'Physics', keysIssued: 18, overdueKeys: 2 },
    { department: 'Chemistry', keysIssued: 22, overdueKeys: 4 },
    { department: 'Biology', keysIssued: 15, overdueKeys: 1 },
    { department: 'Mathematics', keysIssued: 12, overdueKeys: 2 },
    { department: 'Others', keysIssued: 8, overdueKeys: 0 }
  ],
  recentActivity: [
    {
      id: 'ACT001',
      type: 'key_issued',
      description: 'Key R107 issued to Dr. Emily Davis',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Rajesh Kumar'
    },
    {
      id: 'ACT002',
      type: 'key_returned',
      description: 'Key R105 returned by Prof. Sarah Johnson',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'Suresh Reddy'
    },
    {
      id: 'ACT003',
      type: 'key_lost',
      description: 'Key R104 reported lost by Dr. Mike Wilson',
      timestamp: '2024-01-14T16:45:00Z',
      user: 'Venkat Rao'
    },
    {
      id: 'ACT004',
      type: 'key_maintenance',
      description: 'Key R105 sent for maintenance',
      timestamp: '2024-01-14T14:20:00Z',
      user: 'Rajesh Kumar'
    },
    {
      id: 'ACT005',
      type: 'user_added',
      description: 'New faculty member Dr. Lisa Anderson added',
      timestamp: '2024-01-14T11:00:00Z',
      user: 'Rajesh Kumar'
    }
  ]
};

// Helper function to get overdue keys
export const getOverdueKeys = () => {
  const now = new Date();
  return mockKeys.filter(key => {
    if (key.status === 'issued' && key.returnDate) {
      const returnDate = new Date(key.returnDate);
      return returnDate < now;
    }
    return false;
  });
};

// Helper function to get keys by status
export const getKeysByStatus = (status) => {
  return mockKeys.filter(key => key.status === status);
};

// Helper function to get faculty by department
export const getFacultyByDepartment = (department) => {
  return mockFaculty.filter(faculty => faculty.department === department);
};

// Helper function to get active security personnel
export const getActiveSecurityPersonnel = () => {
  return mockSecurityPersonnel.filter(person => person.status === 'active');
};

// Helper function to get recent activity
export const getRecentActivity = (limit = 10) => {
  return mockAnalytics.recentActivity
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

// Helper function to calculate key statistics
export const getKeyStatistics = () => {
  const total = mockKeys.length;
  const available = mockKeys.filter(key => key.status === 'available').length;
  const issued = mockKeys.filter(key => key.status === 'issued').length;
  const lost = mockKeys.filter(key => key.status === 'lost').length;
  const damaged = mockKeys.filter(key => key.status === 'damaged').length;
  const maintenance = mockKeys.filter(key => key.status === 'maintenance').length;
  const overdue = getOverdueKeys().length;

  return {
    total,
    available,
    issued,
    lost,
    damaged,
    maintenance,
    overdue,
    utilizationRate: ((issued / total) * 100).toFixed(1)
  };
};

// Helper function to get department statistics
export const getDepartmentStatistics = () => {
  const departments = {};
  
  mockFaculty.forEach(faculty => {
    if (!departments[faculty.department]) {
      departments[faculty.department] = {
        totalFaculty: 0,
        activeFaculty: 0,
        keysIssued: 0,
        overdueKeys: 0
      };
    }
    
    departments[faculty.department].totalFaculty++;
    if (faculty.status === 'active') {
      departments[faculty.department].activeFaculty++;
    }
    departments[faculty.department].keysIssued += faculty.totalKeysIssued;
    departments[faculty.department].overdueKeys += faculty.overdueKeys;
  });
  
  return departments;
};

// Helper function to search keys
export const searchKeys = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return mockKeys.filter(key => 
    key.keyNumber.toLowerCase().includes(lowercaseQuery) ||
    key.location.toLowerCase().includes(lowercaseQuery) ||
    key.assignedTo?.toLowerCase().includes(lowercaseQuery) ||
    key.status.toLowerCase().includes(lowercaseQuery) ||
    key.notes.toLowerCase().includes(lowercaseQuery)
  );
};

// Helper function to search faculty
export const searchFaculty = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return mockFaculty.filter(faculty => 
    faculty.name.toLowerCase().includes(lowercaseQuery) ||
    faculty.email.toLowerCase().includes(lowercaseQuery) ||
    faculty.department.toLowerCase().includes(lowercaseQuery) ||
    faculty.phone.includes(query)
  );
};
