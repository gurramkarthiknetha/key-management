'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, LoginCredentials, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        verifyToken(savedToken);
      } catch (error) {
        console.error('Error loading saved auth data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      // Set token in API client
      apiClient.setToken(authToken);
      const response = await apiClient.getCurrentUser();

      if (!response.success) {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await apiClient.login(credentials);

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;

        setUser(userData);
        setToken(authToken);

        // Save to localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.logout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for API calls with authentication
export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error('Authentication expired');
    }

    return response;
  };

  return authenticatedFetch;
}
