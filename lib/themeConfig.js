// Theme configuration for VNR Key Management System

export const THEME_CONFIG = {
  // Light theme colors
  light: {
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    
    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Primary brand colors
    primary: {
      50: '#fef2f2',
      100: '#fde8e8',
      200: '#fbd5d5',
      300: '#f8b4b4',
      400: '#f87171',
      500: '#ef4444',
      600: '#88041c',
      700: '#7c0319',
      800: '#6f0216',
      900: '#5f0213'
    },
    
    // Role-specific colors
    faculty: '#3b82f6',
    facultyLight: '#dbeafe',
    security: '#10b981',
    securityLight: '#d1fae5',
    hod: '#8b5cf6',
    hodLight: '#ede9fe',
    securityHead: '#f59e0b',
    securityHeadLight: '#fef3c7',
    
    // Status colors
    success: '#22c55e',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    
    // Shadows
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowSoft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    shadowElevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    shadowModal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  
  // Dark theme colors
  dark: {
    // Background colors
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    
    // Text colors
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#334155',
    borderLight: '#475569',
    
    // Primary brand colors (adjusted for dark mode)
    primary: {
      50: '#1e293b',
      100: '#334155',
      200: '#475569',
      300: '#64748b',
      400: '#94a3b8',
      500: '#cbd5e1',
      600: '#e2e8f0',
      700: '#f1f5f9',
      800: '#f8fafc',
      900: '#ffffff'
    },
    
    // Role-specific colors (slightly adjusted for dark mode)
    faculty: '#60a5fa',
    facultyLight: '#1e3a8a',
    security: '#34d399',
    securityLight: '#064e3b',
    hod: '#a78bfa',
    hodLight: '#4c1d95',
    securityHead: '#fbbf24',
    securityHeadLight: '#92400e',
    
    // Status colors (adjusted for dark mode)
    success: '#34d399',
    successLight: '#064e3b',
    warning: '#fbbf24',
    warningLight: '#92400e',
    danger: '#f87171',
    dangerLight: '#7f1d1d',
    info: '#60a5fa',
    infoLight: '#1e3a8a',
    
    // Shadows (darker for dark mode)
    shadowCard: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    shadowSoft: '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
    shadowElevated: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    shadowModal: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  }
};

// Role-specific theme configurations
export const ROLE_THEMES = {
  faculty: {
    primary: '#3b82f6',
    primaryLight: '#dbeafe',
    gradient: 'from-blue-500 to-blue-600',
    accent: '#1d4ed8'
  },
  security: {
    primary: '#10b981',
    primaryLight: '#d1fae5',
    gradient: 'from-emerald-500 to-emerald-600',
    accent: '#047857'
  },
  hod: {
    primary: '#8b5cf6',
    primaryLight: '#ede9fe',
    gradient: 'from-violet-500 to-violet-600',
    accent: '#7c3aed'
  },
  security_head: {
    primary: '#f59e0b',
    primaryLight: '#fef3c7',
    gradient: 'from-amber-500 to-amber-600',
    accent: '#d97706'
  }
};

// Component-specific theme configurations
export const COMPONENT_THEMES = {
  button: {
    variants: {
      primary: {
        light: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        dark: 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-400'
      },
      secondary: {
        light: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        dark: 'bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-400'
      },
      ghost: {
        light: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        dark: 'text-gray-300 hover:bg-gray-700 focus:ring-gray-400'
      },
      danger: {
        light: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        dark: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-400'
      }
    }
  },
  
  card: {
    variants: {
      default: {
        light: 'bg-white border-gray-200 shadow-sm',
        dark: 'bg-gray-800 border-gray-700 shadow-lg'
      },
      elevated: {
        light: 'bg-white border-gray-200 shadow-lg',
        dark: 'bg-gray-800 border-gray-700 shadow-2xl'
      },
      success: {
        light: 'bg-green-50 border-green-200',
        dark: 'bg-green-900/20 border-green-700'
      },
      warning: {
        light: 'bg-yellow-50 border-yellow-200',
        dark: 'bg-yellow-900/20 border-yellow-700'
      },
      danger: {
        light: 'bg-red-50 border-red-200',
        dark: 'bg-red-900/20 border-red-700'
      }
    }
  },
  
  input: {
    base: {
      light: 'bg-white border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500',
      dark: 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-primary-400 focus:border-primary-400'
    }
  },
  
  modal: {
    overlay: {
      light: 'bg-black/50',
      dark: 'bg-black/70'
    },
    content: {
      light: 'bg-white border-gray-200',
      dark: 'bg-gray-800 border-gray-700'
    }
  }
};

// Animation configurations
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-index scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080
};

// Utility functions for theme management
export const getThemeValue = (theme, path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], THEME_CONFIG[theme]);
};

export const getRoleTheme = (role) => {
  return ROLE_THEMES[role] || ROLE_THEMES.faculty;
};

export const getComponentTheme = (component, variant = 'default', theme = 'light') => {
  return COMPONENT_THEMES[component]?.variants?.[variant]?.[theme] || '';
};

export default THEME_CONFIG;
