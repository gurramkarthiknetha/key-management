'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Building, 
  Users, 
  Key, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Bell,
  Download,
  Eye,
  UserCheck,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HODStats {
  departmentUsers: number;
  activeDepartmentUsers: number;
  departmentKeys: number;
  availableDepartmentKeys: number;
  issuedDepartmentKeys: number;
  overdueDepartmentKeys: number;
  monthlyActivity: number;
  pendingRequests: number;
}

interface DepartmentActivity {
  id: string;
  type: 'check_out' | 'check_in' | 'request' | 'approval';
  userName: string;
  keyName: string;
  timestamp: string;
  status: string;
}

interface PendingRequest {
  id: string;
  userName: string;
  userEmail: string;
  keyName: string;
  requestedAt: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export default function HODDashboard() {
  const { user, authenticatedFetch } = useAuth();
  const [stats, setStats] = useState<HODStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<DepartmentActivity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHODStats();
    fetchRecentActivity();
    fetchPendingRequests();
  }, []);

  const fetchHODStats = async () => {
    try {
      const response = await authenticatedFetch('/api/dashboard/hod');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load HOD statistics');
      }
    } catch (error) {
      console.error('Failed to fetch HOD stats:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await authenticatedFetch('/api/logs?department=mine&limit=10');
      const result = await response.json();
      
      if (result.success) {
        setRecentActivity(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await authenticatedFetch('/api/requests?status=pending&department=mine');
      const result = await response.json();
      
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const response = await authenticatedFetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Request approved successfully');
        fetchPendingRequests();
        fetchHODStats();
      } else {
        toast.error(result.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const response = await authenticatedFetch(`/api/requests/${requestId}/reject`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Request rejected');
        fetchPendingRequests();
      } else {
        toast.error(result.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              HOD Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name} • Head of Department • {user?.department}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/reports/department'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/department/users'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
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
                <p className="text-sm font-medium text-gray-600">Department Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.departmentUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDepartmentUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <KeyRound className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Department Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.departmentKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableDepartmentKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issued Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.issuedDepartmentKeys}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.overdueDepartmentKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Activity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyActivity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Bell className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Pending Approval Requests
        </h2>
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{request.userName}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Requesting: <span className="font-medium">{request.keyName}</span>
                    </p>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Requested: {formatDate(request.requestedAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => approveRequest(request.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(request.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending requests</p>
          </div>
        )}
      </div>

      {/* Recent Department Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Recent Department Activity
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.type === 'check_out' 
                      ? 'bg-blue-100 text-blue-600' 
                      : activity.type === 'check_in'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'check_out' ? (
                      <Key className="h-4 w-4" />
                    ) : activity.type === 'check_in' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.userName} • {activity.keyName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.type === 'check_out'
                    ? 'bg-blue-100 text-blue-800'
                    : activity.type === 'check_in'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Department Management
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/department/users"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Manage Department Users
            </a>
            <a
              href="/dashboard/department/keys"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Department Keys
            </a>
            <a
              href="/dashboard/requests"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              All Requests
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Reports & Analytics
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/reports/department"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Department Reports
            </a>
            <a
              href="/dashboard/analytics"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Usage Analytics
            </a>
            <a
              href="/dashboard/reports/export"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Export Data
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Oversight & Control
          </h3>
          <div className="space-y-3">
            <a
              href="/dashboard/logs?department=mine"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Department Logs
            </a>
            <a
              href="/dashboard/settings/department"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Department Settings
            </a>
            <a
              href="/dashboard/notifications/department"
              className="block text-blue-600 hover:text-blue-800 transition-colors"
            >
              Notification Preferences
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
