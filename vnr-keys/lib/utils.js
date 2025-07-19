// Utility functions for the key management system

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time ago
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

/**
 * Get key status color
 */
export const getKeyStatusColor = (status) => {
  const colors = {
    permanent: 'success',
    temporary: 'warning',
    overdue: 'danger',
    available: 'default',
    'in-use': 'primary',
  };
  return colors[status] || 'default';
};

/**
 * Get key status text
 */
export const getKeyStatusText = (status) => {
  const texts = {
    permanent: 'Permanent',
    temporary: 'Temporary',
    overdue: 'Overdue',
    available: 'Available',
    'in-use': 'In Use',
  };
  return texts[status] || status;
};

/**
 * Generate QR code data for key
 */
export const generateKeyQRData = (keyData) => {
  return JSON.stringify({
    keyId: keyData.id,
    labName: keyData.labName,
    keyName: keyData.keyName,
    facultyId: keyData.facultyId,
    timestamp: new Date().toISOString(),
    type: 'key-access'
  });
};

/**
 * Parse QR code data
 */
export const parseQRData = (qrString) => {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    console.error('Invalid QR code data:', error);
    return null;
  }
};

/**
 * Check if key is overdue
 */
export const isKeyOverdue = (key) => {
  if (!key.dueDate) return false;
  return new Date(key.dueDate) < new Date();
};

/**
 * Calculate overdue days
 */
export const getOverdueDays = (dueDate) => {
  if (!dueDate) return 0;
  const now = new Date();
  const due = new Date(dueDate);
  if (due >= now) return 0;
  return Math.floor((now - due) / (1000 * 60 * 60 * 24));
};

/**
 * Filter keys by search term
 */
export const filterKeys = (keys, searchTerm) => {
  if (!searchTerm) return keys;
  const term = searchTerm.toLowerCase();
  return keys.filter(key => 
    key.keyName?.toLowerCase().includes(term) ||
    key.labName?.toLowerCase().includes(term) ||
    key.keyId?.toLowerCase().includes(term) ||
    key.facultyName?.toLowerCase().includes(term)
  );
};

/**
 * Sort keys by various criteria
 */
export const sortKeys = (keys, sortBy = 'keyName', order = 'asc') => {
  return [...keys].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (order === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

/**
 * Group keys by status
 */
export const groupKeysByStatus = (keys) => {
  return keys.reduce((groups, key) => {
    const status = key.status || 'available';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(key);
    return groups;
  }, {});
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roles = {
    faculty: 'Faculty',
    security: 'Security',
    'security-head': 'Security Head',
    admin: 'Administrator'
  };
  return roles[role] || role;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
