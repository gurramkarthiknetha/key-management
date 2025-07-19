import { Bell, Search, User, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
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
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setShowProfileDropdown(false);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'faculty': return 'Faculty';
      case 'security': return 'Security';
      case 'security-head': return 'Security Head';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'faculty': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-green-100 text-green-800';
      case 'security-head': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
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
        <div className="flex items-center space-x-3">
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

          {/* User Profile Dropdown */}
          {showProfile && user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.userId}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user.userId}</div>
                    <div className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</div>
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
