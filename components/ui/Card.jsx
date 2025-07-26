'use client';

import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = true,
  hover = false,
  onClick,
  role = null, // faculty, security, hod, security-head
  elevated = false,
  interactive = false,
  ...props
}, ref) => {
  const baseClasses = 'bg-surface rounded-2xl border border-default transition-all duration-200';

  const variants = {
    default: '',
    success: 'border-success/30 bg-success-light',
    warning: 'border-warning/30 bg-warning-light',
    danger: 'border-danger/30 bg-danger-light',
    info: 'border-info/30 bg-info-light',
    primary: 'border-primary-200 bg-primary-50',
    faculty: 'border-faculty/30 bg-faculty-light',
    security: 'border-security/30 bg-security-light',
    hod: 'border-hod/30 bg-hod-light',
    'security-head': 'border-security-head/30 bg-security-head-light',
  };

  const paddings = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClass = shadow ? (elevated ? 'shadow-elevated' : 'card-shadow') : '';
  const hoverClass = hover || interactive ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer active:scale-[0.98]' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  // Role-specific styling
  const roleClass = role ? variants[role] : '';
  const finalVariant = role ? '' : variants[variant];

  const classes = `${baseClasses} ${finalVariant} ${roleClass} ${paddings[padding]} ${shadowClass} ${hoverClass} ${clickableClass} ${className}`;

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e);
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
