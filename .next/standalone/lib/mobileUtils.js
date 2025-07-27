// Mobile utility functions and responsive helpers

// Device detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 1024;
};

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Viewport utilities
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
};

export const getViewportWidth = () => {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
};

export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0
  };
};

// Touch interaction utilities
export const addTouchFeedback = (element) => {
  if (!element || !isTouchDevice()) return;
  
  element.addEventListener('touchstart', () => {
    element.style.transform = 'scale(0.98)';
    element.style.opacity = '0.8';
  });
  
  element.addEventListener('touchend', () => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  });
  
  element.addEventListener('touchcancel', () => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  });
};

// Responsive breakpoint utilities
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
};

export const getBreakpoint = () => {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Scroll utilities
export const disableBodyScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

export const enableBodyScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

export const scrollToTop = (smooth = true) => {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

export const scrollToElement = (elementId, offset = 0, smooth = true) => {
  if (typeof document === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

// Keyboard utilities for mobile
export const isVirtualKeyboardOpen = () => {
  if (typeof window === 'undefined') return false;
  
  // Detect if virtual keyboard is open by comparing viewport height
  const initialHeight = window.screen.height;
  const currentHeight = window.innerHeight;
  const threshold = initialHeight * 0.75; // 75% of screen height
  
  return currentHeight < threshold;
};

export const handleVirtualKeyboard = (onOpen, onClose) => {
  if (typeof window === 'undefined') return;
  
  let initialHeight = window.innerHeight;
  
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialHeight - currentHeight;
    
    if (heightDifference > 150) { // Keyboard likely open
      onOpen?.(heightDifference);
    } else { // Keyboard likely closed
      onClose?.();
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

// Orientation utilities
export const getOrientation = () => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const onOrientationChange = (callback) => {
  if (typeof window === 'undefined') return;
  
  const handleOrientationChange = () => {
    setTimeout(() => {
      callback(getOrientation());
    }, 100); // Small delay to ensure dimensions are updated
  };
  
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
  };
};

// Performance utilities for mobile
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

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Haptic feedback (for supported devices)
export const hapticFeedback = (type = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [50, 100, 50],
    warning: [20, 50, 20]
  };
  
  navigator.vibrate(patterns[type] || patterns.light);
};

// Network utilities
export const getConnectionType = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) return 'unknown';
  return navigator.connection.effectiveType || 'unknown';
};

export const isSlowConnection = () => {
  const connectionType = getConnectionType();
  return ['slow-2g', '2g'].includes(connectionType);
};

// Battery utilities
export const getBatteryLevel = async () => {
  if (typeof navigator === 'undefined' || !navigator.getBattery) return null;
  
  try {
    const battery = await navigator.getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
  } catch (error) {
    return null;
  }
};

// Responsive image utilities
export const getOptimalImageSize = (containerWidth) => {
  if (containerWidth <= 320) return 'xs';
  if (containerWidth <= 640) return 'sm';
  if (containerWidth <= 768) return 'md';
  if (containerWidth <= 1024) return 'lg';
  return 'xl';
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Accessibility utilities
export const announceToScreenReader = (message) => {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export default {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  isIOS,
  isAndroid,
  getViewportHeight,
  getViewportWidth,
  getSafeAreaInsets,
  addTouchFeedback,
  useBreakpoint,
  getBreakpoint,
  disableBodyScroll,
  enableBodyScroll,
  scrollToTop,
  scrollToElement,
  isVirtualKeyboardOpen,
  handleVirtualKeyboard,
  getOrientation,
  onOrientationChange,
  debounce,
  throttle,
  hapticFeedback,
  getConnectionType,
  isSlowConnection,
  getBatteryLevel,
  getOptimalImageSize,
  preloadImage,
  announceToScreenReader
};
