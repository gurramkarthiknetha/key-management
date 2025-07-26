'use client';

import { HODRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/useAuth';

export default function HODDashboard() {
  const { user, logout } = useAuth();

  return (
    <HODRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">HOD Dashboard</h1>
                  <p className="text-sm text-gray-500">Head of Department - Key Management System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role} • {user?.department}</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Welcome to HOD Dashboard
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-4">
                    You are logged in as Head of Department with elevated privileges for key management.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Your Access Details:</h4>
                    <ul className="list-disc list-inside text-purple-800 space-y-1">
                      <li><strong>Email:</strong> {user?.email}</li>
                      <li><strong>Role:</strong> {user?.role}</li>
                      <li><strong>Department:</strong> {user?.department}</li>
                      <li><strong>Employee ID:</strong> {user?.employeeId}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HODRoute>
  );
}
