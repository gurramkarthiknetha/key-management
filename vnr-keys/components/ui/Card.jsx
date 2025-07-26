import { forwardRef } from 'react';

const Card = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  shadow = true,
  hover = false,
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'bg-white rounded-2xl border border-gray-200 transition-all duration-200';
  
  const variants = {
    default: '',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    primary: 'border-primary-200 bg-primary-50',
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const shadowClass = shadow ? 'card-shadow' : '';
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${shadowClass} ${hoverClass} ${clickableClass} ${className}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
