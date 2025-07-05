'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import {
  Menu,
  X,
  Home,
  Key,
  Users,
  Building,
  FileText,
  Settings,
  LogOut,
  QrCode,
  BarChart3,
  Shield,
  UserCheck,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['all'] },
    { name: 'Keys', href: '/dashboard/keys', icon: Key, roles: ['all'] },
    { name: 'QR Scanner', href: '/dashboard/scanner', icon: QrCode, roles: [UserRole.SECURITY_STAFF, UserRole.SECURITY_INCHARGE] },
    { name: 'Check-out', href: '/security/checkout', icon: UserCheck, roles: [UserRole.SECURITY_STAFF, UserRole.SECURITY_INCHARGE] },
    { name: 'Check-in', href: '/security/checkin', icon: Shield, roles: [UserRole.SECURITY_STAFF, UserRole.SECURITY_INCHARGE] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: [UserRole.SECURITY_INCHARGE] },
    { name: 'Departments', href: '/admin/departments', icon: Building, roles: [UserRole.SECURITY_INCHARGE] },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Mail, roles: [UserRole.HOD, UserRole.SECURITY_INCHARGE] },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: [UserRole.HOD, UserRole.SECURITY_INCHARGE] },
    { name: 'Logs', href: '/dashboard/logs', icon: FileText, roles: ['all'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['all'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || 
    (user?.role && item.roles.includes(user.role))
  );

  const NavItem = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
    
    return (
      <a
        href={item.href}
        className={`${
          isActive
            ? 'bg-blue-100 border-blue-500 text-blue-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } ${
          mobile
            ? 'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
            : 'group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4'
        }`}
        onClick={() => mobile && setSidebarOpen(false)}
      >
        <item.icon
          className={`${
            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          } ${mobile ? 'mr-3 h-6 w-6' : 'mr-3 h-5 w-5'}`}
        />
        {item.name}
      </a>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">Key Management</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} mobile />
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">Key Management</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.department}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="flex items-center h-16">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {typeof window !== 'undefined' && window.location.pathname === '/dashboard' 
                        ? 'Dashboard' 
                        : filteredNavigation.find(item => 
                            typeof window !== 'undefined' && window.location.pathname.startsWith(item.href)
                          )?.name || 'Dashboard'
                      }
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="hidden md:block">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="ml-2 text-xs text-gray-500">({user?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
