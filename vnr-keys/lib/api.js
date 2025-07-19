import axios from 'axios';
import Cookies from 'js-cookie';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data.data;
      
      // Store token and user data in cookies
      Cookies.set('auth_token', token, { expires: 1 }); // 1 day
      Cookies.set('user_data', JSON.stringify(user), { expires: 1 });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout user
  logout: () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user info' };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },

  // Get user data from cookies
  getUserFromCookies: () => {
    const userData = Cookies.get('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('auth_token');
  }
};

// Key Management API functions
export const keyAPI = {
  // Get all keys (Security and Security-Head only)
  getAllKeys: async () => {
    try {
      const response = await api.get('/api/keys');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch keys' };
    }
  },

  // Get user's assigned keys (Faculty only)
  getMyKeys: async () => {
    try {
      const response = await api.get('/api/keys/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your keys' };
    }
  },

  // Create new key (Security-Head only)
  createKey: async (keyData) => {
    try {
      const response = await api.post('/api/keys', keyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create key' };
    }
  },

  // Assign key to user (Security and Security-Head only)
  assignKey: async (keyId, assignTo) => {
    try {
      const response = await api.put(`/api/keys/${keyId}/assign`, { assignTo });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign key' };
    }
  },

  // Return key (Security and Security-Head only)
  returnKey: async (keyId) => {
    try {
      const response = await api.put(`/api/keys/${keyId}/return`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return key' };
    }
  },

  // Delete key (Security-Head only)
  deleteKey: async (keyId) => {
    try {
      const response = await api.delete(`/api/keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete key' };
    }
  }
};

// General API functions
export const generalAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Health check failed' };
    }
  }
};

export default api;
