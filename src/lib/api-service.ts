/**
 * API Service Layer
 * Replaces Next.js API routes with Express backend calls
 */

import { apiClient } from './api-client';
import { AuthUser, UserRole } from '@/types';

// Re-export the API client for direct use
export { apiClient };

/**
 * Authentication Services
 */
export const authService = {
  async login(email: string, password: string) {
    return apiClient.login({ email, password });
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: UserRole;
    department: string;
  }) {
    return apiClient.register(userData);
  },

  async getCurrentUser() {
    return apiClient.getCurrentUser();
  },

  async logout() {
    return apiClient.logout();
  }
};

/**
 * User Management Services
 */
export const userService = {
  async getUsers() {
    return apiClient.getUsers();
  },

  async getUser(id: string) {
    return apiClient.getUser(id);
  },

  async createUser(userData: any) {
    return apiClient.createUser(userData);
  },

  async updateUser(id: string, userData: any) {
    return apiClient.updateUser(id, userData);
  },

  async deleteUser(id: string) {
    return apiClient.deleteUser(id);
  }
};

/**
 * Key Management Services
 */
export const keyService = {
  async getKeys() {
    return apiClient.getKeys();
  },

  async getKey(id: string) {
    return apiClient.getKey(id);
  },

  async createKey(keyData: {
    name: string;
    description: string;
    department: string;
    location: string;
    category: string;
    priority: string;
    maxLoanDuration: number;
    tags?: string[];
  }) {
    return apiClient.createKey(keyData);
  },

  async updateKey(id: string, keyData: any) {
    return apiClient.updateKey(id, keyData);
  },

  async deleteKey(id: string) {
    return apiClient.deleteKey(id);
  },

  async checkoutKey(data: {
    keyId: string;
    userId: string;
    notes?: string;
    expectedReturnTime?: Date;
  }) {
    return apiClient.checkoutKey(data);
  },

  async checkinKey(data: {
    keyId: string;
    notes?: string;
  }) {
    return apiClient.checkinKey(data);
  }
};

/**
 * Department Services
 */
export const departmentService = {
  async getDepartments() {
    return apiClient.getDepartments();
  },

  async createDepartment(departmentData: any) {
    return apiClient.createDepartment(departmentData);
  },

  async updateDepartment(id: string, departmentData: any) {
    return apiClient.updateDepartment(id, departmentData);
  }
};

/**
 * Log Services
 */
export const logService = {
  async getLogs(filters?: any) {
    return apiClient.getLogs(filters);
  }
};

/**
 * Notification Services
 */
export const notificationService = {
  async getNotifications() {
    return apiClient.getNotifications();
  },

  async markNotificationRead(id: string) {
    return apiClient.markNotificationRead(id);
  },

  async sendNotification(notificationData: any) {
    return apiClient.sendNotification(notificationData);
  }
};

/**
 * Dashboard Services
 */
export const dashboardService = {
  async getStats() {
    return apiClient.getDashboardStats();
  },

  async getAdminDashboard() {
    return apiClient.getAdminDashboard();
  },

  async getSecurityDashboard() {
    return apiClient.getSecurityDashboard();
  },

  async getFacultyDashboard() {
    return apiClient.getFacultyDashboard();
  },

  async getHODDashboard() {
    return apiClient.getHODDashboard();
  }
};

/**
 * Report Services
 */
export const reportService = {
  async generateReport(reportType: string, filters?: any) {
    return apiClient.generateReport(reportType, filters);
  }
};

/**
 * Health Check Service
 */
export const healthService = {
  async checkHealth() {
    return apiClient.healthCheck();
  }
};

/**
 * Utility function to handle API responses consistently
 */
export const handleApiResponse = async <T>(
  apiCall: () => Promise<any>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await apiCall();
    
    if (response.success) {
      onSuccess?.(response.data);
      return { success: true, data: response.data };
    } else {
      const error = response.error || 'API call failed';
      onError?.(error);
      return { success: false, error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError?.(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Batch operations utility
 */
export const batchService = {
  async batchUpdateKeys(updates: Array<{ id: string; data: any }>) {
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => keyService.updateKey(id, data))
    );
    
    return results.map((result, index) => ({
      id: updates[index].id,
      success: result.status === 'fulfilled' && result.value.success,
      error: result.status === 'rejected' ? result.reason : 
             (result.status === 'fulfilled' && !result.value.success ? result.value.error : null)
    }));
  },

  async batchUpdateUsers(updates: Array<{ id: string; data: any }>) {
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => userService.updateUser(id, data))
    );
    
    return results.map((result, index) => ({
      id: updates[index].id,
      success: result.status === 'fulfilled' && result.value.success,
      error: result.status === 'rejected' ? result.reason : 
             (result.status === 'fulfilled' && !result.value.success ? result.value.error : null)
    }));
  }
};

/**
 * Cache service for frequently accessed data
 */
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const cacheService = new CacheService();

/**
 * Cached API calls
 */
export const cachedApiService = {
  async getDepartments(useCache = true) {
    const cacheKey = 'departments';
    
    if (useCache) {
      const cached = cacheService.get(cacheKey);
      if (cached) return { success: true, data: cached };
    }

    const response = await departmentService.getDepartments();
    if (response.success) {
      cacheService.set(cacheKey, response.data, 10); // Cache for 10 minutes
    }
    
    return response;
  },

  async getUsers(useCache = true) {
    const cacheKey = 'users';
    
    if (useCache) {
      const cached = cacheService.get(cacheKey);
      if (cached) return { success: true, data: cached };
    }

    const response = await userService.getUsers();
    if (response.success) {
      cacheService.set(cacheKey, response.data, 5); // Cache for 5 minutes
    }
    
    return response;
  },

  invalidateCache(keys?: string[]) {
    if (keys) {
      keys.forEach(key => cacheService.delete(key));
    } else {
      cacheService.clear();
    }
  }
};

// Default export with all services
export default {
  auth: authService,
  user: userService,
  key: keyService,
  department: departmentService,
  log: logService,
  notification: notificationService,
  dashboard: dashboardService,
  report: reportService,
  health: healthService,
  batch: batchService,
  cache: cachedApiService,
  client: apiClient
};
