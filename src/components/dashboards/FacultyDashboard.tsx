'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Key, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Search,
  BookOpen,
  User,
  History,
  FileText,
  Bell,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FacultyStats {
  availableKeys: number;
  myCurrentKeys: number;
  myOverdueKeys: number;
  departmentKeys: number;
  recentRequests: number;
}

interface MyKey {
  id: string;
  keyName: string;
  location: string;
  checkedOutAt: string;
  dueDate: string;
  isOverdue: boolean;
  daysRemaining: number;
}

interface AvailableKey {
  id: string;
  name: string;
  location: string;
  description: string;
  department: string;
}

export default function FacultyDashboard() {
  const { user, authenticatedFetch } = useAuth();
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [myKeys, setMyKeys] = useState<MyKey[]>([]);
  const [availableKeys, setAvailableKeys] = useState<AvailableKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFacultyStats();
    fetchMyKeys();
    fetchAvailableKeys();
  }, []);

  const fetchFacultyStats = async () => {
    try {
      const response = await authenticatedFetch('/api/dashboard/faculty');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load faculty statistics');
      }
    } catch (error) {
      console.error('Failed to fetch faculty stats:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchMyKeys = async () => {
    try {
      const response = await authenticatedFetch('/api/keys/my-keys');
      const result = await response.json();
      
      if (result.success) {
        setMyKeys(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch my keys:', error);
    }
  };

  const fetchAvailableKeys = async () => {
    try {
      const response = await authenticatedFetch('/api/keys?status=available&limit=5');
      const result = await response.json();
      
      if (result.success) {
        setAvailableKeys(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch available keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestKey = async (keyId: string) => {
    try {
      const response = await authenticatedFetch('/api/keys/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Key request submitted successfully');
        fetchFacultyStats();
      } else {
        toast.error(result.error || 'Failed to request key');
      }
    } catch (error) {
      console.error('Failed to request key:', error);
      toast.error('Failed to submit key request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          {[...Array(5)].map((_, i) => (
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
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              Faculty Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name} • Faculty/Lab Staff • {user?.department}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/keys'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Keys
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/my-keys'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Key className="h-4 w-4 mr-2" />
              My Keys
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Current Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myCurrentKeys}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.myOverdueKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Department Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.departmentKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentRequests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Current Keys */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Key className="h-5 w-5 mr-2" />
          My Current Keys
        </h2>
        {myKeys.length > 0 ? (
          <div className="space-y-4">
            {myKeys.map((key) => (
              <div key={key.id} className={`p-4 rounded-lg border-l-4 ${
                key.isOverdue 
                  ? 'bg-red-50 border-red-400' 
                  : key.daysRemaining <= 1 
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-green-50 border-green-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{key.keyName}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {key.location}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Checked out: {formatDate(key.checkedOutAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      key.isOverdue 
                        ? 'text-red-600' 
                        : key.daysRemaining <= 1 
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}>
                      {key.isOverdue 
                        ? `Overdue by ${Math.abs(key.daysRemaining)} days`
                        : key.daysRemaining === 0
                          ? 'Due today'
                          : `${key.daysRemaining} days remaining`
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(key.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any keys checked out</p>
            <button
              onClick={() => window.location.href = '/dashboard/keys'}
              className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
            >
              Browse available keys
            </button>
          </div>
        )}
      </div>

      {/* Available Keys */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Available Keys
          </h2>
          <a
            href="/dashboard/keys"
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            View all →
          </a>
        </div>
        {availableKeys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableKeys.map((key) => (
              <div key={key.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{key.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {key.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{key.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{key.department}</p>
                  </div>
                  <button
                    onClick={() => requestKey(key.id)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No keys available at the moment</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Browse & Request
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/keys"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Browse All Keys
            </a>
            <a
              href="/dashboard/keys?department=mine"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              My Department Keys
            </a>
            <a
              href="/dashboard/requests"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              My Requests
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" />
            History & Reports
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/my-keys"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              My Key History
            </a>
            <a
              href="/dashboard/logs?user=me"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              My Transaction Log
            </a>
            <a
              href="/dashboard/reports/personal"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Personal Reports
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account & Help
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/profile"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              My Profile
            </a>
            <a
              href="/dashboard/notifications"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Notification Settings
            </a>
            <a
              href="/help"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Help & Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
