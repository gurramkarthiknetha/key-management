'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../../lib/useAuth';

export default function RedirectDashboard() {
  const { data: session, status } = useSession();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (status === 'loading' || loading) {
      return;
    }

    if (!session || !user) {
      window.location.href = '/login';
      return;
    }

    if (!user.role) {
      window.location.href = '/login?error=no_role';
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
    
    // Use replace to avoid back button issues
    window.location.replace(dashboardUrl);
  }, [session, user, status, loading]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        {user?.email && (
          <p className="text-sm text-gray-500 mt-2">
            {user.email} ({user.role || 'No role assigned'})
          </p>
        )}
      </div>
    </div>
  );
}
