'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Key, 
  QrCode, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  LogOut,
  LogIn,
  Search,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SecurityStats {
  totalKeys: number;
  availableKeys: number;
  issuedKeys: number;
  overdueKeys: number;
  todayCheckouts: number;
  todayCheckins: number;
  myShiftActivity: number;
}

interface RecentActivity {
  id: string;
  type: 'check_out' | 'check_in';
  keyName: string;
  userName: string;
  timestamp: string;
  location: string;
}

export default function SecurityStaffDashboard() {
  const { user, authenticatedFetch } = useAuth();
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityStats();
    fetchRecentActivity();
  }, []);

  const fetchSecurityStats = async () => {
    try {
      const response = await authenticatedFetch('/api/dashboard/security');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load security statistics');
      }
    } catch (error) {
      console.error('Failed to fetch security stats:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await authenticatedFetch('/api/logs?limit=10&type=recent');
      const result = await response.json();
      
      if (result.success) {
        setRecentActivity(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Check-out Key',
      description: 'Issue a key to a user',
      icon: LogOut,
      color: 'blue',
      action: () => window.location.href = '/security/checkout'
    },
    {
      title: 'Check-in Key',
      description: 'Return a key from a user',
      icon: LogIn,
      color: 'green',
      action: () => window.location.href = '/security/checkin'
    },
    {
      title: 'QR Scanner',
      description: 'Scan QR codes for quick transactions',
      icon: QrCode,
      color: 'purple',
      action: () => window.location.href = '/security/scanner'
    },
    {
      title: 'Search Keys',
      description: 'Find keys by name or location',
      icon: Search,
      color: 'orange',
      action: () => window.location.href = '/dashboard/keys'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {[...Array(6)].map((_, i) => (
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
              Security Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name} • Security Staff • {user?.department}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/security/checkout'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Check-out
            </button>
            <button
              onClick={() => window.location.href = '/security/checkin'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Check-in
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
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issued</p>
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
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <LogOut className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Check-outs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCheckouts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <LogIn className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCheckins}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.type === 'check_out' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'check_out' ? (
                      <LogOut className="h-4 w-4" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.keyName} • {activity.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.location} • {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.type === 'check_out'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {activity.type === 'check_out' ? 'Checked Out' : 'Checked In'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Key Operations
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/keys"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All Keys
            </a>
            <a
              href="/dashboard/keys?status=available"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Available Keys
            </a>
            <a
              href="/dashboard/keys?status=issued"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Currently Issued Keys
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Reports & Logs
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/logs"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Transaction History
            </a>
            <a
              href="/dashboard/reports/daily"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Daily Reports
            </a>
            <a
              href="/dashboard/keys?status=overdue"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Overdue Keys Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
