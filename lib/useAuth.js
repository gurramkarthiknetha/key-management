"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import authService from './authService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);

    try {
      // Check if user is already authenticated
      const currentUser = authService.getUser();
      const token = authService.getToken();

      if (currentUser && token) {
        // Validate session with backend
        const validation = await authService.validateSession();

        if (validation.isAuthenticated) {
          setUser(validation.user);
          setIsAuthenticated(true);
        } else {
          // Session invalid, clear local storage
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

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

  const login = async (email, otp) => {
    try {
      setLoading(true);
      const result = await authService.login(email, otp);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (email, purpose = 'login') => {
    try {
      const result = await authService.requestOTP(email, purpose);
      return result;
    } catch (error) {
      console.error('OTP request error:', error);
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email, otp, purpose = 'email_verification') => {
    try {
      const result = await authService.verifyOTP(email, otp, purpose);
      return result;
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: 'OTP verification failed' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const result = await authService.resetPassword(email, otp, newPassword);
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
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
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    requestOTP,
    verifyOTP,
    resetPassword,
    hasRole,
    hasAnyRole,
    isRole,
    navigateToDashboard,
    getDashboardUrl,
    initializeAuth
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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/security/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
