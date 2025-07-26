// Utility functions for the key management system

/**
 * Get the appropriate color class for key status badges
 * @param {string} status - The status of the key
 * @returns {string} - The color class for the badge
 */
export function getKeyStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'issued':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'lost':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'damaged':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'retired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - The formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  
  const {
    includeTime = false,
    format = 'short' // 'short', 'long', 'medium'
  } = options;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const formatOptions = {
      year: 'numeric',
      month: format === 'long' ? 'long' : format === 'medium' ? 'short' : 'numeric',
      day: 'numeric'
    };
    
    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - The relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      }
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'N/A';
  }
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a unique ID
 * @returns {string} - A unique ID string
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - The value to check
 * @returns {boolean} - True if empty, false otherwise
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 * @param {any} obj - The object to clone
 * @returns {any} - The cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - The size in bytes
 * @returns {string} - The formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get initials from a name
 * @param {string} name - The full name
 * @returns {string} - The initials
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substr(0, 2);
}

/**
 * Sort array of objects by a property
 * @param {Array} array - The array to sort
 * @param {string} property - The property to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} - The sorted array
 */
export function sortBy(array, property, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array of objects by search term
 * @param {Array} array - The array to filter
 * @param {string} searchTerm - The search term
 * @param {Array} searchFields - The fields to search in
 * @returns {Array} - The filtered array
 */
export function filterBySearch(array, searchTerm, searchFields = []) {
  if (!searchTerm || !searchTerm.trim()) return array;

  const term = searchTerm.toLowerCase().trim();

  return array.filter(item => {
    if (searchFields.length === 0) {
      // Search in all string properties
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      );
    } else {
      // Search in specified fields
      return searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(term);
      });
    }
  });
}

/**
 * Calculate the number of overdue days for a key
 * @param {string|Date} returnDate - The expected return date
 * @returns {number} - Number of overdue days (0 if not overdue)
 */
export function getOverdueDays(returnDate) {
  if (!returnDate) return 0;

  try {
    const returnDateObj = typeof returnDate === 'string' ? new Date(returnDate) : returnDate;
    const now = new Date();

    if (isNaN(returnDateObj.getTime())) return 0;

    const diffInMs = now - returnDateObj;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? diffInDays : 0;
  } catch (error) {
    console.error('Error calculating overdue days:', error);
    return 0;
  }
}

/**
 * Get display name for user roles
 * @param {string} role - The role identifier
 * @returns {string} - The display name for the role
 */
export function getRoleDisplayName(role) {
  const roleMap = {
    'security': 'Security Personnel',
    'security_head': 'Security Head',
    'faculty': 'Faculty Member',
    'admin': 'Administrator',
    'student': 'Student',
    'staff': 'Staff Member',
    'maintenance': 'Maintenance Staff',
    'guest': 'Guest User'
  };

  return roleMap[role] || capitalize(role) || 'Unknown Role';
}

/**
 * Get priority level for overdue keys
 * @param {number} overdueDays - Number of overdue days
 * @returns {string} - Priority level (low, medium, high, critical)
 */
export function getOverduePriority(overdueDays) {
  if (overdueDays <= 0) return 'none';
  if (overdueDays <= 3) return 'low';
  if (overdueDays <= 7) return 'medium';
  if (overdueDays <= 14) return 'high';
  return 'critical';
}

/**
 * Get color class for overdue priority
 * @param {string} priority - Priority level
 * @returns {string} - CSS color class
 */
export function getOverduePriorityColor(priority) {
  switch (priority) {
    case 'low':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'critical':
      return 'text-red-800 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format Indian phone numbers
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return original if format not recognized
}

/**
 * Check if a date is within a range
 * @param {string|Date} date - Date to check
 * @param {string|Date} startDate - Start of range
 * @param {string|Date} endDate - End of range
 * @returns {boolean} - True if date is within range
 */
export function isDateInRange(date, startDate, endDate) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

    return dateObj >= startObj && dateObj <= endObj;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
}
