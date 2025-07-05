/**
 * API Integration Example Component
 * Demonstrates how to use the new API client with React hooks
 */

'use client';

import React, { useState } from 'react';
import { 
  useAuth, 
  useKeys, 
  useUsers, 
  useDepartments, 
  useNotifications,
  useDashboardStats,
  useCreateKey,
  useCheckoutKey,
  useCheckinKey,
  useMutation
} from '@/hooks/useApi';
import { apiClient } from '@/lib/api-client';

export default function ApiIntegrationExample() {
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [checkoutUserId, setCheckoutUserId] = useState<string>('');

  // Authentication
  const { user, loading: authLoading, login, logout } = useAuth();

  // Data fetching hooks
  const { data: keys, loading: keysLoading, error: keysError, refetch: refetchKeys } = useKeys();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const { data: notifications, loading: notificationsLoading } = useNotifications();
  const { data: dashboardStats, loading: statsLoading } = useDashboardStats();

  // Mutation hooks
  const createKeyMutation = useCreateKey();
  const checkoutKeyMutation = useCheckoutKey();
  const checkinKeyMutation = useCheckinKey();

  // Custom mutation example
  const healthCheckMutation = useMutation(
    () => apiClient.healthCheck(),
    {
      onSuccess: (data) => {
        console.log('Health check successful:', data);
      },
      onError: (error) => {
        console.error('Health check failed:', error);
      }
    }
  );

  // Event handlers
  const handleCreateKey = async () => {
    try {
      await createKeyMutation.mutate({
        name: 'Test Key',
        description: 'A test key created via API',
        department: 'IT',
        location: 'Room 101',
        category: 'Lab',
        priority: 'Medium',
        maxLoanDuration: 24,
        tags: ['test', 'api']
      });
      
      // Refetch keys after creation
      refetchKeys();
      alert('Key created successfully!');
    } catch (error) {
      alert('Failed to create key');
    }
  };

  const handleCheckoutKey = async () => {
    if (!selectedKeyId || !checkoutUserId) {
      alert('Please select a key and user');
      return;
    }

    try {
      await checkoutKeyMutation.mutate({
        keyId: selectedKeyId,
        userId: checkoutUserId,
        notes: 'Checked out via API example',
        expectedReturnTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
      refetchKeys();
      alert('Key checked out successfully!');
    } catch (error) {
      alert('Failed to checkout key');
    }
  };

  const handleCheckinKey = async () => {
    if (!selectedKeyId) {
      alert('Please select a key');
      return;
    }

    try {
      await checkinKeyMutation.mutate({
        keyId: selectedKeyId,
        notes: 'Checked in via API example'
      });
      
      refetchKeys();
      alert('Key checked in successfully!');
    } catch (error) {
      alert('Failed to checkin key');
    }
  };

  const handleHealthCheck = () => {
    healthCheckMutation.mutate();
  };

  if (authLoading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Please Login</h2>
        <p>You need to be logged in to see the API integration example.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>
      
      {/* User Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <button 
          onClick={logout}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Health Check */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Server Health Check</h2>
        <button 
          onClick={handleHealthCheck}
          disabled={healthCheckMutation.loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {healthCheckMutation.loading ? 'Checking...' : 'Check Server Health'}
        </button>
        {healthCheckMutation.error && (
          <p className="text-red-500 mt-2">Error: {healthCheckMutation.error}</p>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard Statistics</h2>
        {statsLoading ? (
          <p>Loading stats...</p>
        ) : dashboardStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardStats.totalKeys || 0}</div>
              <div className="text-sm text-gray-600">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardStats.availableKeys || 0}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardStats.checkedOutKeys || 0}</div>
              <div className="text-sm text-gray-600">Checked Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dashboardStats.overdueKeys || 0}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        ) : (
          <p>No stats available</p>
        )}
      </div>

      {/* Keys Management */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Keys Management</h2>
        
        {/* Create Key */}
        <div className="mb-4">
          <button 
            onClick={handleCreateKey}
            disabled={createKeyMutation.loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createKeyMutation.loading ? 'Creating...' : 'Create Test Key'}
          </button>
          {createKeyMutation.error && (
            <p className="text-red-500 mt-2">Error: {createKeyMutation.error}</p>
          )}
        </div>

        {/* Keys List */}
        {keysLoading ? (
          <p>Loading keys...</p>
        ) : keysError ? (
          <p className="text-red-500">Error loading keys: {keysError}</p>
        ) : keys && keys.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-2">Available Keys:</h3>
            <select 
              value={selectedKeyId} 
              onChange={(e) => setSelectedKeyId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a key...</option>
              {keys.map((key: any) => (
                <option key={key._id || key.id} value={key._id || key.id}>
                  {key.name} - {key.status} ({key.location})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p>No keys available</p>
        )}

        {/* Users for Checkout */}
        {usersLoading ? (
          <p>Loading users...</p>
        ) : users && users.length > 0 ? (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Select User for Checkout:</h3>
            <select 
              value={checkoutUserId} 
              onChange={(e) => setCheckoutUserId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a user...</option>
              {users.map((user: any) => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Key Operations */}
        <div className="flex gap-2">
          <button 
            onClick={handleCheckoutKey}
            disabled={checkoutKeyMutation.loading || !selectedKeyId || !checkoutUserId}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {checkoutKeyMutation.loading ? 'Checking Out...' : 'Checkout Key'}
          </button>
          
          <button 
            onClick={handleCheckinKey}
            disabled={checkinKeyMutation.loading || !selectedKeyId}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {checkinKeyMutation.loading ? 'Checking In...' : 'Checkin Key'}
          </button>
        </div>

        {(checkoutKeyMutation.error || checkinKeyMutation.error) && (
          <p className="text-red-500 mt-2">
            Error: {checkoutKeyMutation.error || checkinKeyMutation.error}
          </p>
        )}
      </div>

      {/* Departments */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Departments</h2>
        {departmentsLoading ? (
          <p>Loading departments...</p>
        ) : departments && departments.length > 0 ? (
          <ul className="list-disc list-inside">
            {departments.map((dept: any, index: number) => (
              <li key={dept._id || dept.id || index}>
                {dept.name} - {dept.description || 'No description'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No departments available</p>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Recent Notifications</h2>
        {notificationsLoading ? (
          <p>Loading notifications...</p>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification: any, index: number) => (
              <div key={notification._id || notification.id || index} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400">
                  {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'No date'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No notifications available</p>
        )}
      </div>
    </div>
  );
}
