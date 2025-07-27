"use client";

import { Bell, Search, User, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      case 'faculty_lab_staff': return 'Faculty/Lab Staff';
      case 'security_staff': return 'Security Personnel';
      case 'hod': return 'Head of Department';
      case 'security_incharge': return 'Security In-charge';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'faculty_lab_staff': return 'bg-primary-100 text-primary-800';
      case 'security_staff': return 'bg-green-100 text-green-800';
      case 'hod': return 'bg-indigo-600 text-white';
      case 'security_incharge': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <header className={`bg-gray-800 border-b border-gray-700 px-4 py-3 ${className}`}>
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
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <img
              src="/VNRVJIETLOGO.png"
              alt="VNR VJIET Logo"
              className="w-100 h-16 object-contain"
            />
            {/* <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {title}
            </h1> */}
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
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white">{user.userId}</div>
                    {/* <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </div> */}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-300" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border border-gray-700 py-1 z-50 bg-gray-800"
                >
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="text-sm font-bold text-gray-100">
                      {user.userId}
                    </div>
                    <div className="text-xs font-semibold text-gray-300">
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-700 flex items-center space-x-2 text-gray-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-700 flex items-center space-x-2 text-red-400"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
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
                      