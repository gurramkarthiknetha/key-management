'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import AdminDashboard from './AdminDashboard';
import SecurityStaffDashboard from './SecurityStaffDashboard';
import FacultyDashboard from './FacultyDashboard';
import HODDashboard from './HODDashboard';
import { AlertTriangle } from 'lucide-react';

export default function RoleDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to access the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.SECURITY_INCHARGE:
      return <AdminDashboard />;
    
    case UserRole.SECURITY_STAFF:
      return <SecurityStaffDashboard />;
    
    case UserRole.FACULTY_LAB_STAFF:
      return <FacultyDashboard />;
    
    case UserRole.HOD:
      return <HODDashboard />;
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unknown Role</h2>
            <p className="text-gray-600 mb-4">
              Your user role ({user.role}) is not recognized. Please contact your administrator.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/dashboard/profile'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => window.location.href = '/logout'}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      );
  }
}
