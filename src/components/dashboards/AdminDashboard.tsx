'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Users, 
  Key, 
  Building, 
  Settings, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Mail,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalKeys: number;
  availableKeys: number;
  issuedKeys: number;
  overdueKeys: number;
  totalDepartments: number;
  recentActivity: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

export default function AdminDashboard() {
  const { user, authenticatedFetch } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await authenticatedFetch('/api/dashboard/admin');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load admin statistics');
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: Users,
      color: 'blue',
      action: () => window.location.href = '/dashboard/users/new'
    },
    {
      title: 'Add New Key',
      description: 'Register a new key in the system',
      icon: Key,
      color: 'green',
      action: () => window.location.href = '/dashboard/keys/new'
    },
    {
      title: 'Add Department',
      description: 'Create a new department',
      icon: Building,
      color: 'purple',
      action: () => window.location.href = '/dashboard/departments/new'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      color: 'gray',
      action: () => window.location.href = '/dashboard/settings'
    },
    {
      title: 'Email Notifications',
      description: 'Manage email settings and send notifications',
      icon: Mail,
      color: 'orange',
      action: () => window.location.href = '/dashboard/notifications'
    },
    {
      title: 'Generate Reports',
      description: 'Create and download system reports',
      icon: BarChart3,
      color: 'indigo',
      action: () => window.location.href = '/dashboard/reports'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name} • Security Incharge
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/logs'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              View Logs
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/reports'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issued Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.issuedKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 border rounded-lg transition-colors text-left ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start">
                <action.icon className="h-6 w-6 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm opacity-75 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/users"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All Users
            </a>
            <a
              href="/dashboard/users/new"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Add New User
            </a>
            <a
              href="/dashboard/users/inactive"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Manage Inactive Users
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Key Management
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/keys"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All Keys
            </a>
            <a
              href="/dashboard/keys/new"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Add New Key
            </a>
            <a
              href="/dashboard/keys/overdue"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Overdue Keys
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Management
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/departments"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Manage Departments
            </a>
            <a
              href="/dashboard/settings"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              System Settings
            </a>
            <a
              href="/dashboard/logs"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              System Logs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
