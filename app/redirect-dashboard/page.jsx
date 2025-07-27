'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../../lib/useAuth';

export default function RedirectDashboard() {
  const { data: session, status } = useSession();
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      console.log('🚫 Already redirected, skipping...');
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
      loading,
      hasRedirected
    });

    if (!session || !user) {
      console.log('❌ No session or user, redirecting to login');
      setDebugInfo('No session or user found. Redirecting to login...');
      setHasRedirected(true);
      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    if (!user.role) {
      console.log('❌ User has no role assigned');
      setDebugInfo(`User ${user.email} has no role assigned. Please contact admin.`);
      setHasRedirected(true);
      redirectTimeoutRef.current = setTimeout(() => {
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
    setHasRedirected(true);

    // Use replace to avoid back button issues
    redirectTimeoutRef.current = setTimeout(() => {
      window.location.replace(dashboardUrl);
    }, 1000);

    // Cleanup function
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [session, user, status, loading, hasRedirected]);

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

        {hasRedirected && (
          <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 mb-4">
            Redirect initiated... If you're not redirected automatically, please click below:
          </div>
        )}

        <div className="mt-4 space-y-2">
          {user?.role && (
            <a
              href={user.role === 'faculty' ? '/faculty' :
                    user.role === 'hod' ? '/hod' :
                    user.role === 'security' ? '/security' :
                    user.role === 'security_head' ? '/securityincharge' :
                    user.role === 'admin' ? '/admin' : '/login'}
              className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </a>
          )}
          <a href="/login" className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
