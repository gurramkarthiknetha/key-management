'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  isTouchDevice,
  getBreakpoint,
  getOrientation,
  onOrientationChange,
  handleVirtualKeyboard,
  debounce
} from './mobileUtils';

export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    breakpoint: 'xs',
    orientation: 'portrait',
    isKeyboardOpen: false
  });

  const updateDeviceInfo = useCallback(
    debounce(() => {
      setDeviceInfo({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        isTouchDevice: isTouchDevice(),
        breakpoint: getBreakpoint(),
        orientation: getOrientation(),
        isKeyboardOpen: deviceInfo.isKeyboardOpen
      });
    }, 100),
    [deviceInfo.isKeyboardOpen]
  );

  useEffect(() => {
    // Initial setup
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    // Listen for orientation changes
    const cleanupOrientation = onOrientationChange(() => {
      updateDeviceInfo();
    });

    // Listen for virtual keyboard
    const cleanupKeyboard = handleVirtualKeyboard(
      () => setDeviceInfo(prev => ({ ...prev, isKeyboardOpen: true })),
      () => setDeviceInfo(prev => ({ ...prev, isKeyboardOpen: false }))
    );

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      cleanupOrientation?.();
      cleanupKeyboard?.();
    };
  }, [updateDeviceInfo]);

  return deviceInfo;
};

export const useBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const current = getBreakpoint();
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const currentIndex = breakpoints.indexOf(current);
      const targetIndex = breakpoints.indexOf(breakpoint);
      setMatches(currentIndex >= targetIndex);
    };

    checkBreakpoint();
    const debouncedCheck = debounce(checkBreakpoint, 100);
    
    window.addEventListener('resize', debouncedCheck);
    return () => window.removeEventListener('resize', debouncedCheck);
  }, [breakpoint]);

  return matches;
};

export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    setOrientation(getOrientation());
    
    const cleanup = onOrientationChange((newOrientation) => {
      setOrientation(newOrientation);
    });

    return cleanup;
  }, []);

  return orientation;
};

export const useVirtualKeyboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const cleanup = handleVirtualKeyboard(
      (height) => {
        setIsOpen(true);
        setKeyboardHeight(height);
      },
      () => {
        setIsOpen(false);
        setKeyboardHeight(0);
      }
    );

    return cleanup;
  }, []);

  return { isOpen, keyboardHeight };
};

export const useTouchGestures = (elementRef) => {
  const [gestures, setGestures] = useState({
    isPressed: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isTouchDevice()) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setGestures(prev => ({
        ...prev,
        isPressed: true,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0
      }));
    };

    const handleTouchMove = (e) => {
      if (!gestures.isPressed) return;
      
      const touch = e.touches[0];
      setGestures(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: touch.clientX - prev.startX,
        deltaY: touch.clientY - prev.startY
      }));
    };

    const handleTouchEnd = () => {
      setGestures(prev => ({
        ...prev,
        isPressed: false,
        deltaX: 0,
        deltaY: 0
      }));
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [elementRef, gestures.isPressed]);

  return gestures;
};

export const useSwipeGesture = (elementRef, options = {}) => {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const gestures = useTouchGestures(elementRef);

  useEffect(() => {
    if (!gestures.isPressed && (Math.abs(gestures.deltaX) > threshold || Math.abs(gestures.deltaY) > threshold)) {
      const absX = Math.abs(gestures.deltaX);
      const absY = Math.abs(gestures.deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (gestures.deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (gestures.deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [gestures, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return gestures;
};

export const useInfiniteScroll = (callback, options = {}) => {
  const { threshold = 100, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = debounce(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        callback();
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold, enabled]);
};

export const usePullToRefresh = (elementRef, onRefresh, options = {}) => {
  const { threshold = 80, enabled = true } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled || !isTouchDevice()) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e) => {
      if (element.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      isPulling = false;
      
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [elementRef, onRefresh, threshold, enabled, pullDistance]);

  return { isRefreshing, pullDistance };
};

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    }, 10);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
};

export default {
  useResponsive,
  useBreakpoint,
  useOrientation,
  useVirtualKeyboard,
  useTouchGestures,
  useSwipeGesture,
  useInfiniteScroll,
  usePullToRefresh,
  useScrollDirection
};
