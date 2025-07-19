// Mock data for development and testing

export const mockKeys = [
  {
    id: 'KEY001',
    keyId: 'LAB-CS-001',
    keyName: 'Computer Lab 1 Main Key',
    labName: 'Computer Science Lab 1',
    department: 'Computer Science',
    status: 'permanent',
    facultyId: 'FAC001',
    facultyName: 'Dr. John Smith',
    assignedDate: '2024-01-15T09:00:00Z',
    dueDate: null,
    location: 'Block A, Floor 2',
    description: 'Main access key for CS Lab 1'
  },
  {
    id: 'KEY002',
    keyId: 'LAB-PH-002',
    keyName: 'Physics Lab Key',
    labName: 'Physics Laboratory',
    department: 'Physics',
    status: 'temporary',
    facultyId: 'FAC002',
    facultyName: 'Prof. Sarah Johnson',
    assignedDate: '2024-07-18T10:30:00Z',
    dueDate: '2024-07-19T17:00:00Z',
    location: 'Block B, Floor 1',
    description: 'Temporary access for evening experiments'
  },
  {
    id: 'KEY003',
    keyId: 'LAB-CH-003',
    keyName: 'Chemistry Lab Key',
    labName: 'Chemistry Laboratory',
    department: 'Chemistry',
    status: 'overdue',
    facultyId: 'FAC003',
    facultyName: 'Dr. Michael Brown',
    assignedDate: '2024-07-15T14:00:00Z',
    dueDate: '2024-07-17T18:00:00Z',
    location: 'Block C, Floor 3',
    description: 'Key for chemical storage access'
  },
  {
    id: 'KEY004',
    keyId: 'LAB-BIO-004',
    keyName: 'Biology Lab Key',
    labName: 'Biology Laboratory',
    department: 'Biology',
    status: 'available',
    facultyId: null,
    facultyName: null,
    assignedDate: null,
    dueDate: null,
    location: 'Block D, Floor 2',
    description: 'Main biology lab access key'
  },
  {
    id: 'KEY005',
    keyId: 'LAB-EE-005',
    keyName: 'Electronics Lab Key',
    labName: 'Electronics Laboratory',
    department: 'Electrical Engineering',
    status: 'in-use',
    facultyId: 'FAC004',
    facultyName: 'Dr. Emily Davis',
    assignedDate: '2024-07-18T08:00:00Z',
    dueDate: '2024-07-18T20:00:00Z',
    location: 'Block E, Floor 1',
    description: 'Electronics equipment access'
  }
];

export const mockFaculty = [
  {
    id: 'FAC001',
    name: 'Dr. John Smith',
    email: 'john.smith@vnr.edu',
    department: 'Computer Science',
    phone: '+91 9876543210',
    role: 'faculty',
    joinDate: '2020-08-15',
    status: 'active'
  },
  {
    id: 'FAC002',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@vnr.edu',
    department: 'Physics',
    phone: '+91 9876543211',
    role: 'faculty',
    joinDate: '2019-07-20',
    status: 'active'
  },
  {
    id: 'FAC003',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@vnr.edu',
    department: 'Chemistry',
    phone: '+91 9876543212',
    role: 'faculty',
    joinDate: '2021-01-10',
    status: 'active'
  },
  {
    id: 'FAC004',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@vnr.edu',
    department: 'Electrical Engineering',
    phone: '+91 9876543213',
    role: 'faculty',
    joinDate: '2022-03-05',
    status: 'active'
  }
];

export const mockSecurityPersonnel = [
  {
    id: 'SEC001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@vnr.edu',
    phone: '+91 9876543220',
    role: 'security',
    shift: 'morning',
    joinDate: '2023-01-15',
    status: 'active'
  },
  {
    id: 'SEC002',
    name: 'Priya Sharma',
    email: 'priya.sharma@vnr.edu',
    phone: '+91 9876543221',
    role: 'security',
    shift: 'evening',
    joinDate: '2023-02-20',
    status: 'active'
  },
  {
    id: 'SECH001',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@vnr.edu',
    phone: '+91 9876543225',
    role: 'security-head',
    shift: 'all',
    joinDate: '2020-05-10',
    status: 'active'
  }
];

export const mockKeyHistory = [
  {
    id: 'HIST001',
    keyId: 'LAB-CS-001',
    facultyId: 'FAC001',
    action: 'assigned',
    timestamp: '2024-01-15T09:00:00Z',
    securityPersonnelId: 'SEC001',
    notes: 'Permanent assignment for semester'
  },
  {
    id: 'HIST002',
    keyId: 'LAB-PH-002',
    facultyId: 'FAC002',
    action: 'assigned',
    timestamp: '2024-07-18T10:30:00Z',
    securityPersonnelId: 'SEC001',
    notes: 'Temporary for evening experiments'
  },
  {
    id: 'HIST003',
    keyId: 'LAB-CH-003',
    facultyId: 'FAC003',
    action: 'assigned',
    timestamp: '2024-07-15T14:00:00Z',
    securityPersonnelId: 'SEC002',
    notes: 'Chemical storage access needed'
  },
  {
    id: 'HIST004',
    keyId: 'LAB-EE-005',
    facultyId: 'FAC004',
    action: 'assigned',
    timestamp: '2024-07-18T08:00:00Z',
    securityPersonnelId: 'SEC001',
    notes: 'Electronics lab session'
  }
];

export const mockAnalytics = {
  totalKeys: 25,
  keysInUse: 8,
  keysAvailable: 15,
  overdueKeys: 2,
  dailyCheckouts: [
    { date: '2024-07-14', checkouts: 12, checkins: 10 },
    { date: '2024-07-15', checkouts: 15, checkins: 13 },
    { date: '2024-07-16', checkouts: 8, checkins: 11 },
    { date: '2024-07-17', checkouts: 18, checkins: 16 },
    { date: '2024-07-18', checkouts: 14, checkins: 8 }
  ],
  departmentUsage: [
    { department: 'Computer Science', usage: 35 },
    { department: 'Physics', usage: 25 },
    { department: 'Chemistry', usage: 20 },
    { department: 'Biology', usage: 15 },
    { department: 'Electrical Engineering', usage: 5 }
  ]
};

// Helper functions to get mock data
export const getKeyById = (id) => mockKeys.find(key => key.id === id);
export const getFacultyById = (id) => mockFaculty.find(faculty => faculty.id === id);
export const getSecurityById = (id) => mockSecurityPersonnel.find(security => security.id === id);
export const getKeyHistory = (keyId) => mockKeyHistory.filter(history => history.keyId === keyId);
export const getFacultyKeys = (facultyId) => mockKeys.filter(key => key.facultyId === facultyId);
export const getOverdueKeys = () => mockKeys.filter(key => key.status === 'overdue');
export const getAvailableKeys = () => mockKeys.filter(key => key.status === 'available');
