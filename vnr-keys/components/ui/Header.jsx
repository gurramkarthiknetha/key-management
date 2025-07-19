import { Bell, Search, User, Menu } from 'lucide-react';
import Button from './Button';

const Header = ({ 
  title = "VNR Key Management", 
  showNotifications = true, 
  showSearch = false, 
  showProfile = true,
  onNotificationClick,
  onProfileClick,
  onMenuClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  className = ""
}) => {
  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Logo and title */}
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              icon={<Menu className="h-5 w-5" />}
              className="lg:hidden"
            />
          )}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VNR</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {title}
            </h1>
          </div>
        </div>

        {/* Center - Search (if enabled) */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              icon={<Bell className="h-5 w-5" />}
              className="relative"
            >
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
          )}
          
          {showProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              icon={<User className="h-5 w-5" />}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
