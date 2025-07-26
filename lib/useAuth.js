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
  const navigateToDashboard = () => {
    const dashboardUrl = getDashboardUrl(user?.role);
    console.log('🚀 navigateToDashboard: Navigating to:', {
      userRole: user?.role,
      dashboardUrl,
      userEmail: user?.email
    });

    try {
      console.log('🚀 navigateToDashboard: Attempting router.push...');
      router.push(dashboardUrl);

      // Fallback to window.location if router.push doesn't work
      setTimeout(() => {
        console.log('🚀 navigateToDashboard: Router.push timeout, using window.location fallback');
        window.location.href = dashboardUrl;
      }, 1000);
    } catch (error) {
      console.error('🚀 navigateToDashboard: Router.push failed, using window.location:', error);
      window.location.href = dashboardUrl;
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

export default useAuth;
