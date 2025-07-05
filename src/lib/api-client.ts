/**
 * API Client for Key Management System
 * Handles all communication with the Express.js backend server
 */

import { AuthUser, UserRole } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  role: UserRole;
  department: string;
}

interface KeyRequest {
  name: string;
  description: string;
  department: string;
  location: string;
  category: string;
  priority: string;
  maxLoanDuration: number;
  tags?: string[];
}

interface CheckoutRequest {
  keyId: string;
  userId: string;
  notes?: string;
  expectedReturnTime?: Date;
}

interface CheckinRequest {
  keyId: string;
  notes?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== HEALTH CHECK ====================
  
  /**
   * Check server health
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // ==================== AUTHENTICATION ====================

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    const response = await this.request<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/api/auth/me');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.setToken(null);
  }

  // ==================== USERS ====================

  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse<AuthUser[]>> {
    return this.request<AuthUser[]>('/api/users');
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>(`/api/users/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(userData: RegisterRequest): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== DEPARTMENTS ====================

  /**
   * Get all departments
   */
  async getDepartments(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/departments');
  }

  /**
   * Create new department
   */
  async createDepartment(departmentData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  /**
   * Update department
   */
  async updateDepartment(id: string, departmentData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  }

  // ==================== KEYS ====================

  /**
   * Get all keys
   */
  async getKeys(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/keys');
  }

  /**
   * Get key by ID
   */
  async getKey(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/keys/${id}`);
  }

  /**
   * Create new key
   */
  async createKey(keyData: KeyRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/api/keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    });
  }

  /**
   * Update key
   */
  async updateKey(id: string, keyData: Partial<any>): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(keyData),
    });
  }

  /**
   * Delete key
   */
  async deleteKey(id: string): Promise<ApiResponse> {
    return this.request(`/api/keys/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check out key
   */
  async checkoutKey(checkoutData: CheckoutRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/api/keys/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  /**
   * Check in key
   */
  async checkinKey(checkinData: CheckinRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/api/keys/checkin', {
      method: 'POST',
      body: JSON.stringify(checkinData),
    });
  }

  // ==================== LOGS ====================

  /**
   * Get activity logs
   */
  async getLogs(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request<any[]>(`/api/logs${queryParams}`);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications
   */
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/notifications');
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<ApiResponse> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Send notification
   */
  async sendNotification(notificationData: any): Promise<ApiResponse> {
    return this.request('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // ==================== DASHBOARD ====================

  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/stats');
  }

  /**
   * Get admin dashboard data
   */
  async getAdminDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/admin');
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/security');
  }

  /**
   * Get faculty dashboard data
   */
  async getFacultyDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/faculty');
  }

  /**
   * Get HOD dashboard data
   */
  async getHODDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/dashboard/hod');
  }

  // ==================== REPORTS ====================

  /**
   * Generate report
   */
  async generateReport(reportType: string, filters?: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, filters }),
    });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
