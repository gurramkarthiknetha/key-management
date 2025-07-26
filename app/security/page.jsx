'use client';

import { SecurityRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/useAuth';

export default function SecurityDashboard() {
  const { user, logout } = useAuth();

  return (
    <SecurityRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                  <p className="text-sm text-gray-500">Security Staff - Key Management System</p>
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
                  Welcome to Security Dashboard
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-4">
                    You are logged in as Security Staff with access to key monitoring and management functions.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-medium text-green-900 mb-2">Your Access Details:</h4>
                    <ul className="list-disc list-inside text-green-800 space-y-1">
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
    </SecurityRoute>
  );
}
