/**
 * React Hooks for API Integration
 * Provides easy-to-use hooks for all API operations
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { AuthUser, UserRole } from '@/types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Generic API hook
 */
export function useApi<T>(
  apiCall: () => Promise<any>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        onSuccess?.(response.data);
      } else {
        throw new Error(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

/**
 * Authentication hooks
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: UserRole;
    department: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.register(userData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const getCurrentUser = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
  };
}

/**
 * Users management hooks
 */
export function useUsers(options?: UseApiOptions) {
  return useApi<AuthUser[]>(() => apiClient.getUsers(), options);
}

export function useUser(id: string, options?: UseApiOptions) {
  return useApi<AuthUser>(() => apiClient.getUser(id), options);
}

/**
 * Keys management hooks
 */
export function useKeys(options?: UseApiOptions) {
  return useApi<any[]>(() => apiClient.getKeys(), options);
}

export function useKey(id: string, options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getKey(id), options);
}

/**
 * Departments hooks
 */
export function useDepartments(options?: UseApiOptions) {
  return useApi<any[]>(() => apiClient.getDepartments(), options);
}

/**
 * Logs hooks
 */
export function useLogs(filters?: any, options?: UseApiOptions) {
  return useApi<any[]>(() => apiClient.getLogs(filters), options);
}

/**
 * Notifications hooks
 */
export function useNotifications(options?: UseApiOptions) {
  return useApi<any[]>(() => apiClient.getNotifications(), options);
}

/**
 * Dashboard hooks
 */
export function useDashboardStats(options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getDashboardStats(), options);
}

export function useAdminDashboard(options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getAdminDashboard(), options);
}

export function useSecurityDashboard(options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getSecurityDashboard(), options);
}

export function useFacultyDashboard(options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getFacultyDashboard(), options);
}

export function useHODDashboard(options?: UseApiOptions) {
  return useApi<any>(() => apiClient.getHODDashboard(), options);
}

/**
 * Mutation hooks for create/update/delete operations
 */
export function useMutation<T = any>(
  mutationFn: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await mutationFn(...args);
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Mutation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      options.onError?.(errorMessage);
      throw error;
    }
  }, [mutationFn, options]);

  return {
    ...state,
    mutate,
  };
}

/**
 * Key operations mutations
 */
export function useCreateKey() {
  return useMutation((keyData: any) => apiClient.createKey(keyData));
}

export function useUpdateKey() {
  return useMutation((id: string, keyData: any) => apiClient.updateKey(id, keyData));
}

export function useDeleteKey() {
  return useMutation((id: string) => apiClient.deleteKey(id));
}

export function useCheckoutKey() {
  return useMutation((checkoutData: any) => apiClient.checkoutKey(checkoutData));
}

export function useCheckinKey() {
  return useMutation((checkinData: any) => apiClient.checkinKey(checkinData));
}

/**
 * User operations mutations
 */
export function useCreateUser() {
  return useMutation((userData: any) => apiClient.createUser(userData));
}

export function useUpdateUser() {
  return useMutation((id: string, userData: any) => apiClient.updateUser(id, userData));
}

export function useDeleteUser() {
  return useMutation((id: string) => apiClient.deleteUser(id));
}

/**
 * Department operations mutations
 */
export function useCreateDepartment() {
  return useMutation((departmentData: any) => apiClient.createDepartment(departmentData));
}

export function useUpdateDepartment() {
  return useMutation((id: string, departmentData: any) => 
    apiClient.updateDepartment(id, departmentData)
  );
}
