'use client';

import { forwardRef } from 'react';

const BottomNavigation = forwardRef(({
  items = [],
  activeItem,
  onItemClick,
  className = "",
  variant = "default", // default, faculty, security, hod, security-head
  showLabels = true,
  badge = null // For notifications
}, ref) => {

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'faculty':
        return {
          bg: 'bg-surface border-default',
          active: 'text-faculty bg-faculty/10',
          inactive: 'text-secondary hover:text-faculty hover:bg-faculty/5'
        };
      case 'security':
        return {
          bg: 'bg-surface border-default',
          active: 'text-security bg-security/10',
          inactive: 'text-secondary hover:text-security hover:bg-security/5'
        };
      case 'hod':
        return {
          bg: 'bg-surface border-default',
          active: 'text-hod bg-hod/10',
          inactive: 'text-secondary hover:text-hod hover:bg-hod/5'
        };
      case 'security-head':
        return {
          bg: 'bg-surface border-default',
          active: 'text-security-head bg-security-head/10',
          inactive: 'text-secondary hover:text-security-head hover:bg-security-head/5'
        };
      default:
        return {
          bg: 'bg-surface border-default',
          active: 'text-primary-600 bg-primary-50',
          inactive: 'text-secondary hover:text-primary hover:bg-primary-50'
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <nav
      ref={ref}
      className={`fixed bottom-0 left-0 right-0 ${styles.bg} border-t px-2 py-1 safe-area-pb z-50 ${className}`}
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, index) => {
          const isActive = activeItem === item.id;
          const hasNotification = item.badge && item.badge > 0;

          return (
            <button
              key={item.id || index}
              onClick={() => onItemClick?.(item)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
                isActive ? styles.active : styles.inactive
              }`}
              aria-label={item.label}
            >
              {/* Notification Badge */}
              {hasNotification && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}

              {/* Icon */}
              <div className={`mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                {item.icon}
              </div>

              {/* Label */}
              {showLabels && (
                <span className="text-xs font-medium leading-tight text-center">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
