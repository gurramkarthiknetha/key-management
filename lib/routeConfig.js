// Route configuration for VNR Key Management System

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  DEMO: '/demo',
  
  // Faculty routes
  FACULTY: '/faculty',
  FACULTY_KEYS: '/faculty?tab=keys',
  FACULTY_DEPOSIT: '/faculty?tab=deposit',
  FACULTY_DEPT_KEYS: '/faculty?tab=dept-keys',
  FACULTY_HISTORY: '/faculty?tab=history',
  
  // Security routes
  SECURITY: '/security',
  SECURITY_SCAN: '/security?tab=scan',
  SECURITY_PENDING: '/security?tab=pending',
  SECURITY_LOGS: '/security?tab=logs',
  
  // HOD routes
  HOD: '/hod',
  HOD_USAGE: '/hod?tab=usage',
  HOD_ACCESS: '/hod?tab=access',
  HOD_REPORTS: '/hod?tab=reports',
  
  // Security Head routes
  SECURITY_HEAD: '/securityincharge',
  SECURITY_HEAD_DASHBOARD: '/securityincharge?tab=dashboard',
  SECURITY_HEAD_USERS: '/securityincharge?tab=users',
  SECURITY_HEAD_KEYS: '/securityincharge?tab=keys',
  SECURITY_HEAD_REPORTS: '/securityincharge?tab=reports',
  
  // Profile and settings
  PROFILE: '/profile',
  SETTINGS: '/settings'
};

// Role-based route access configuration
export const ROLE_ROUTES = {
  faculty: {
    default: ROUTES.FACULTY,
    allowed: [
      ROUTES.FACULTY,
      ROUTES.PROFILE,
      ROUTES.SETTINGS
    ],
    navigation: [
      { id: 'keys', label: 'Keys', path: ROUTES.FACULTY_KEYS },
      { id: 'deposit', label: 'Deposit', path: ROUTES.FACULTY_DEPOSIT },
      { id: 'dept-keys', label: 'Dept Keys', path: ROUTES.FACULTY_DEPT_KEYS },
      { id: 'history', label: 'History', path: ROUTES.FACULTY_HISTORY }
    ]
  },
  
  security: {
    default: ROUTES.SECURITY,
    allowed: [
      ROUTES.SECURITY,
      ROUTES.PROFILE,
      ROUTES.SETTINGS
    ],
    navigation: [
      { id: 'scan', label: 'Scan', path: ROUTES.SECURITY_SCAN },
      { id: 'pending', label: 'Pending', path: ROUTES.SECURITY_PENDING },
      { id: 'logs', label: 'Today Logs', path: ROUTES.SECURITY_LOGS }
    ]
  },
  
  hod: {
    default: ROUTES.HOD,
    allowed: [
      ROUTES.HOD,
      ROUTES.PROFILE,
      ROUTES.SETTINGS
    ],
    navigation: [
      { id: 'usage', label: 'Usage', path: ROUTES.HOD_USAGE },
      { id: 'access', label: 'Access', path: ROUTES.HOD_ACCESS },
      { id: 'reports', label: 'Reports', path: ROUTES.HOD_REPORTS }
    ]
  },
  
  security_head: {
    default: ROUTES.SECURITY_HEAD,
    allowed: [
      ROUTES.SECURITY_HEAD,
      ROUTES.PROFILE,
      ROUTES.SETTINGS
    ],
    navigation: [
      { id: 'dashboard', label: 'Dashboard', path: ROUTES.SECURITY_HEAD_DASHBOARD },
      { id: 'users', label: 'Users', path: ROUTES.SECURITY_HEAD_USERS },
      { id: 'keys', label: 'Keys', path: ROUTES.SECURITY_HEAD_KEYS },
      { id: 'reports', label: 'Reports', path: ROUTES.SECURITY_HEAD_REPORTS }
    ]
  }
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
    SESSION: '/api/auth/session'
  },
  
  // Keys management
  KEYS: {
    BASE: '/api/keys',
    MY_KEYS: '/api/keys?type=my-keys',
    DEPT_KEYS: '/api/keys?type=dept-keys',
    ALL_KEYS: '/api/keys?type=all',
    HISTORY: '/api/keys/history',
    SHARE: '/api/keys/share',
    GENERATE_QR: '/api/keys/qr'
  },
  
  // Security operations
  SECURITY: {
    SCAN: '/api/security/scan',
    PENDING: '/api/security/pending',
    LOGS: '/api/security/logs'
  },
  
  // HOD operations
  HOD: {
    ANALYTICS: '/api/hod/analytics',
    FACULTY: '/api/hod/faculty',
    REPORTS: '/api/hod/reports'
  },
  
  // Admin operations (Security Head)
  ADMIN: {
    USERS: '/api/admin/users',
    KEYS: '/api/admin/keys',
    SYSTEM: '/api/admin/system'
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    SETTINGS: '/api/notifications/settings'
  }
};

// Navigation configuration for mobile bottom navigation
export const NAVIGATION_CONFIG = {
  faculty: {
    variant: 'faculty',
    items: [
      {
        id: 'keys',
        label: 'Keys',
        icon: 'Key',
        path: ROUTES.FACULTY_KEYS,
        badge: null
      },
      {
        id: 'deposit',
        label: 'Deposit',
        icon: 'Upload',
        path: ROUTES.FACULTY_DEPOSIT
      },
      {
        id: 'dept-keys',
        label: 'Dept Keys',
        icon: 'Building2',
        path: ROUTES.FACULTY_DEPT_KEYS
      },
      {
        id: 'history',
        label: 'History',
        icon: 'History',
        path: ROUTES.FACULTY_HISTORY
      }
    ]
  },
  
  security: {
    variant: 'security',
    items: [
      {
        id: 'scan',
        label: 'Scan',
        icon: 'ScanLine',
        path: ROUTES.SECURITY_SCAN
      },
      {
        id: 'pending',
        label: 'Pending',
        icon: 'Clock',
        path: ROUTES.SECURITY_PENDING,
        badge: 'dynamic' // Will be populated from API
      },
      {
        id: 'logs',
        label: 'Today Logs',
        icon: 'FileText',
        path: ROUTES.SECURITY_LOGS
      }
    ]
  },
  
  hod: {
    variant: 'hod',
    items: [
      {
        id: 'usage',
        label: 'Usage',
        icon: 'BarChart3',
        path: ROUTES.HOD_USAGE
      },
      {
        id: 'access',
        label: 'Access',
        icon: 'Users',
        path: ROUTES.HOD_ACCESS
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'FileText',
        path: ROUTES.HOD_REPORTS
      }
    ]
  },
  
  security_head: {
    variant: 'security-head',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'BarChart3',
        path: ROUTES.SECURITY_HEAD_DASHBOARD,
        badge: 'dynamic'
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'Users',
        path: ROUTES.SECURITY_HEAD_USERS
      },
      {
        id: 'keys',
        label: 'Keys',
        icon: 'Key',
        path: ROUTES.SECURITY_HEAD_KEYS
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'FileText',
        path: ROUTES.SECURITY_HEAD_REPORTS
      }
    ]
  }
};

// Route protection configuration
export const PROTECTED_ROUTES = {
  // Routes that require authentication
  AUTHENTICATED: [
    ROUTES.FACULTY,
    ROUTES.SECURITY,
    ROUTES.HOD,
    ROUTES.SECURITY_HEAD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
  ],
  
  // Routes that redirect authenticated users
  GUEST_ONLY: [
    ROUTES.LOGIN
  ],
  
  // Public routes accessible to all
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.DEMO
  ]
};

// Utility functions for route management
export const getDefaultRoute = (userRole) => {
  return ROLE_ROUTES[userRole]?.default || ROUTES.HOME;
};

export const isRouteAllowed = (route, userRole) => {
  if (PROTECTED_ROUTES.PUBLIC.includes(route)) return true;
  if (!userRole) return PROTECTED_ROUTES.GUEST_ONLY.includes(route);
  
  return ROLE_ROUTES[userRole]?.allowed.includes(route) || false;
};

export const getNavigationConfig = (userRole) => {
  return NAVIGATION_CONFIG[userRole] || null;
};

export const getApiEndpoint = (category, endpoint) => {
  return API_ENDPOINTS[category]?.[endpoint] || null;
};

// Route parameter extraction utilities
export const extractTabFromUrl = (url) => {
  const urlObj = new URL(url, 'http://localhost');
  return urlObj.searchParams.get('tab') || null;
};

export const buildRouteWithTab = (basePath, tab) => {
  return `${basePath}?tab=${tab}`;
};

// Mobile-specific route configurations
export const MOBILE_ROUTES = {
  // Routes that should always use mobile layout
  MOBILE_ONLY: [
    ROUTES.FACULTY,
    ROUTES.SECURITY,
    ROUTES.HOD,
    ROUTES.SECURITY_HEAD
  ],
  
  // Routes that have different mobile/desktop layouts
  RESPONSIVE: [
    ROUTES.DEMO,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
  ]
};

export default {
  ROUTES,
  ROLE_ROUTES,
  API_ENDPOINTS,
  NAVIGATION_CONFIG,
  PROTECTED_ROUTES,
  MOBILE_ROUTES,
  getDefaultRoute,
  isRouteAllowed,
  getNavigationConfig,
  getApiEndpoint,
  extractTabFromUrl,
  buildRouteWithTab
};
