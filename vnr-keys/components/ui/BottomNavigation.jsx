import { forwardRef } from 'react';

const BottomNavigation = forwardRef(({ 
  items = [], 
  activeItem,
  onItemClick,
  className = ""
}, ref) => {
  return (
    <nav 
      ref={ref}
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 ${className}`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, index) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id || index}
              onClick={() => onItemClick?.(item)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
