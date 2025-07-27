"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import Cookies from 'js-cookie';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        department: session.user.department,
        employeeId: session.user.employeeId,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [session, status]);

  // Role-based access control helpers
  const hasRole = (requiredRole) => {
    if (!user?.role) return false;

    const roleHierarchy = {
      'admin': 4,
      'security_head': 3,
      'hod': 2,
      'security': 1,
      'faculty': 1
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const isRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user?.role || !Array.isArray(roles)) return false;
    return roles.includes(user.role);
  };

  const login = async (provider = 'google') => {
    try {
      const result = await signIn(provider, {
        callbackUrl: getDashboardUrl(user?.role) || '/'
      });
      return { success: true, result };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper function to get dashboard URL based on role
  const getDashboardUrl = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'hod':
        return '/hod';
      case 'security_head':
        return '/securityincharge';
      case 'security':
        return '/security';
      case 'faculty':
        return '/faculty';
      default:
        return '/';
    }
  };

  // Role-based navigation
  const navigateToDashboard = async () => {
    console.log('🚀 navigateToDashboard: Starting navigation process...', {
      userRole: user?.role,
      userEmail: user?.email,
      sessionStatus: status,
      hasSession: !!session
    });

    // If no user role, try to refresh session first
    if (!user?.role && session?.user?.email) {
      console.log('🚀 navigateToDashboard: No user role found, attempting to refresh session...');
      try {
        // Force session refresh
        await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      } catch (error) {
        console.error('🚀 navigateToDashboard: Session refresh failed:', error);
      }
    }

    const dashboardUrl = getDashboardUrl(user?.role);
    console.log('🚀 navigateToDashboard: Navigating to:', {
      userRole: user?.role,
      dashboardUrl,
      userEmail: user?.email
    });

    // If no valid dashboard URL, redirect to home
    if (!dashboardUrl || dashboardUrl === '/') {
      console.log('🚀 navigateToDashboard: No valid dashboard URL, redirecting to login for role assignment');
      window.location.href = '/login?error=no_role';
      return;
    }

    try {
      console.log('🚀 navigateToDashboard: Attempting router.push...');

      // Use replace instead of push to avoid back button issues
      router.replace(dashboardUrl);

      // Immediate fallback for production environments
      setTimeout(() => {
        console.log('🚀 navigateToDashboard: Using window.location fallback');
        window.location.replace(dashboardUrl);
      }, 100);
    } catch (error) {
      console.error('🚀 navigateToDashboard: Router.push failed, using window.location:', error);
      window.location.replace(dashboardUrl);
    }
  };

  const value = {
    user,
    loading: loading || status === 'loading',
    login,
    logout,
    hasRole,
    hasAnyRole,
    isRole,
    navigateToDashboard,
    getDashboardUrl,
    session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// QR Scanner Hook
export function useQRScanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const clearError = () => setError(null);
  const clearResult = () => setScanResult(null);

  const scanQRCode = async (qrData, location, deviceInfo) => {
    setLoading(true);
    setError(null);

    try {
      // Determine the appropriate API endpoint based on user role
      // For now, we'll use the security scan endpoint for all users
      // This might need to be adjusted based on your specific requirements
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData,
          action: 'collection', // or 'deposit' based on context
          location,
          deviceInfo
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process QR code');
      }

      setScanResult(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to process QR code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    scanResult,
    clearError,
    clearResult,
    scanQRCode
  };
}

export default useAuth;
