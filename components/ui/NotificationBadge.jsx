'use client';

import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { forwardRef } from 'react';

const NotificationBadge = forwardRef(({
  count = 0,
  type = 'default', // default, warning, danger, success, info
  size = 'md',
  className = '',
  onClick,
  showIcon = true,
  animate = true,
  ...props
}, ref) => {
  if (count === 0) return null;

  const sizeClasses = {
    sm: 'min-w-[16px] h-4 text-xs px-1',
    md: 'min-w-[20px] h-5 text-xs px-1.5',
    lg: 'min-w-[24px] h-6 text-sm px-2'
  };

  const typeClasses = {
    default: 'bg-primary-600 text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
    success: 'bg-success text-white',
    info: 'bg-info text-white'
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'danger': return <AlertTriangle className="h-3 w-3" />;
      case 'success': return <CheckCircle className="h-3 w-3" />;
      case 'info': return <Info className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const displayCount = count > 99 ? '99+' : count.toString();
  const animateClass = animate ? 'animate-bounce-in' : '';

  return (
    <div
      ref={ref}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${typeClasses[type]}
        rounded-full font-bold
        ${animateClass}
        ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {showIcon && count === 1 ? getIcon() : displayCount}
    </div>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

export default NotificationBadge;
