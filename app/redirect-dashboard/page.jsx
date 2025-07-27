'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../../lib/useAuth';

export default function RedirectDashboard() {
  const { data: session, status } = useSession();
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    // Prevent infinite redirects
    if (redirectAttempts >= 3) {
      console.error('🚨 Too many redirect attempts, stopping to prevent infinite loop');
      setDebugInfo('Too many redirect attempts. Please contact support.');
      return;
    }

    if (status === 'loading' || loading) {
      setDebugInfo(`Loading... Status: ${status}, Auth Loading: ${loading}`);
      return;
    }

    console.log('🔍 Redirect Dashboard Debug:', {
      session: !!session,
      sessionEmail: session?.user?.email,
      user: !!user,
      userEmail: user?.email,
      userRole: user?.role,
      status,
      loading
    });

    if (!session || !user) {
      console.log('❌ No session or user, redirecting to login');
      setDebugInfo('No session or user found. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    if (!user.role) {
      console.log('❌ User has no role assigned');
      setDebugInfo(`User ${user.email} has no role assigned. Please contact admin.`);
      setTimeout(() => {
        window.location.href = '/login?error=no_role';
      }, 3000);
      return;
    }

    // Direct navigation based on role
    let dashboardUrl = '/';
    switch (user.role) {
      case 'faculty':
        dashboardUrl = '/faculty';
        break;
      case 'hod':
        dashboardUrl = '/hod';
        break;
      case 'security':
        dashboardUrl = '/security';
        break;
      case 'security_head':
        dashboardUrl = '/securityincharge';
        break;
      case 'admin':
        dashboardUrl = '/admin';
        break;
      default:
        dashboardUrl = '/login?error=invalid_role';
    }

    console.log(`🎯 Redirecting ${user.email} with role ${user.role} to ${dashboardUrl}`);
    setDebugInfo(`Redirecting ${user.email} (${user.role}) to ${dashboardUrl}...`);

    setRedirectAttempts(prev => prev + 1);

    // Use replace to avoid back button issues
    setTimeout(() => {
      window.location.replace(dashboardUrl);
    }, 1000);
  }, [session, user, status, loading, redirectAttempts]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-4">Redirecting to your dashboard...</p>

        {user?.email && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <p className="text-sm text-gray-700 font-medium">{user.email}</p>
            <p className="text-sm text-gray-500">
              Role: {user.role || 'No role assigned'}
            </p>
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-4">
            {debugInfo}
          </div>
        )}

        {redirectAttempts >= 3 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700 font-medium">Redirect Error</p>
            <p className="text-red-600 text-sm mt-1">
              Unable to redirect automatically. Please try:
            </p>
            <div className="mt-3 space-y-2">
              <a href="/login" className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Go to Login
              </a>
              <a href="/debug-nav" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Debug Navigation
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
