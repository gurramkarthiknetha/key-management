import axios from 'axios';
import Cookies from 'js-cookie';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const FRONTEND_API_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000; // 10 seconds
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Use Next.js API routes for better security and SSR support
const USE_NEXTJS_API = process.env.NEXT_PUBLIC_USE_NEXTJS_API !== 'false';

// Log API configuration in debug mode
if (DEBUG_MODE) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    debugMode: DEBUG_MODE,
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  });
}

// Create axios instances for both direct backend and Next.js API routes
const backendApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

const frontendApi = axios.create({
  baseURL: FRONTEND_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

// Choose which API instance to use
const api = USE_NEXTJS_API ? frontendApi : backendApi;

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add timestamp to requests for debugging
    config.metadata = { startTime: new Date() };

    // Add auth token if available
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (DEBUG_MODE) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    if (DEBUG_MODE) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;

    if (DEBUG_MODE) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }

    return response;
  },
  async (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;

    if (DEBUG_MODE) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        message: error.message,
        data: error.response?.data
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      if (typeof window !== 'undefined') {
        removeTokenFromCookies();
        window.location.href = '/login';
      }
    }

    // Handle network errors with retry logic
    if (!error.response && error.config && !error.config.__isRetryRequest) {
      error.config.__isRetryRequest = true;
      error.config.__retryCount = (error.config.__retryCount || 0) + 1;

      if (error.config.__retryCount <= 3) {
        const delay = Math.pow(2, error.config.__retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(error.config);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get token from cookies
const getTokenFromCookies = () => {
  if (typeof window === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  } catch (error) {
    console.error('Error getting token from cookies:', error);
    return null;
  }
};

// Helper function to remove token from cookies
const removeTokenFromCookies = () => {
  if (typeof window === 'undefined') return;

  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for debugging
    config.metadata = { startTime: new Date() };

    // Log request in debug mode
    if (DEBUG_MODE) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    if (DEBUG_MODE) {
      console.error('📤 Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and logging
api.interceptors.response.use(
  (response) => {
    // Log response in debug mode
    if (DEBUG_MODE) {
      const duration = new Date() - response.config.metadata?.startTime;
      console.log('📥 API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log error in debug mode
    if (DEBUG_MODE) {
      console.error('📥 API Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('🔐 Authentication failed, redirecting to login');
      Cookies.remove('auth_token');
      Cookies.remove('user_data');

      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.warn('🚫 Access forbidden');
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server error');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if backend is running');
    }

    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      if (DEBUG_MODE) {
        console.log('📝 Attempting registration with:', {
          userData: { ...userData, password: '***' },
          url: USE_NEXTJS_API ? `${FRONTEND_API_URL}/api/auth/register` : `${API_BASE_URL}/api/auth/register`
        });
      }

      const endpoint = USE_NEXTJS_API ? '/api/auth/register' : '/api/auth/register';
      const response = await api.post(endpoint, userData);

      if (DEBUG_MODE) {
        console.log('✅ Registration response:', {
          status: response.status,
          data: response.data
        });
      }

      return response.data;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('❌ Registration error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    try {
      if (DEBUG_MODE) {
        console.log('🔑 Attempting OTP verification with:', {
          otpData: { ...otpData, otp: '***' },
          url: USE_NEXTJS_API ? `${FRONTEND_API_URL}/api/auth/verify-otp` : `${API_BASE_URL}/api/auth/verify-otp`
        });
      }

      const endpoint = USE_NEXTJS_API ? '/api/auth/verify-otp' : '/api/auth/verify-otp';
      const response = await api.post(endpoint, otpData);

      if (DEBUG_MODE) {
        console.log('✅ OTP verification response:', {
          status: response.status,
          data: { ...response.data, token: response.data.token ? '***' : undefined }
        });
      }

      return response;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('❌ OTP verification failed:', error.response?.data || error.message);
      }
      throw error.response?.data || { message: error.message || 'OTP verification failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      if (DEBUG_MODE) {
        console.log('🔐 Attempting login with:', {
          credentials: { ...credentials, password: '***' },
          url: USE_NEXTJS_API ? `${FRONTEND_API_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/login`
        });
      }

      const endpoint = USE_NEXTJS_API ? '/api/auth/login' : '/api/auth/login';
      const response = await api.post(endpoint, credentials);

      if (DEBUG_MODE) {
        console.log('✅ Login response:', {
          status: response.status,
          data: response.data
        });
      }

      // When using Next.js API routes, cookies are set server-side
      if (!USE_NEXTJS_API) {
        const { token } = response.data;
        const { user } = response.data.data;
        // Store token and user data in cookies for direct backend calls
        Cookies.set('auth_token', token, { expires: 1 }); // 1 day
        Cookies.set('user_data', JSON.stringify(user), { expires: 1 });
      }

      return response.data;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('❌ Login error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      if (USE_NEXTJS_API) {
        // Use Next.js API route for logout (clears HTTP-only cookies)
        await api.post('/api/auth/logout');
      } else {
        // Clear client-side cookies for direct backend calls
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    } catch (error) {
      // Even if logout fails, clear local cookies
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      if (DEBUG_MODE) {
        console.error('❌ Logout error:', error);
      }
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/auth/me' : '/api/auth/me';

      if (!USE_NEXTJS_API) {
        const token = Cookies.get('auth_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } else {
        // For Next.js API routes, token is handled server-side via HTTP-only cookies
        const response = await api.get(endpoint);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user info' };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/auth/me' : '/api/auth/me';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },

  // Get user data from cookies
  getUserFromCookies: () => {
    try {
      if (USE_NEXTJS_API) {
        // For Next.js API routes, get user data from the user cookie
        const userData = Cookies.get('user');
        return userData ? JSON.parse(userData) : null;
      } else {
        // For direct backend calls, get from user_data cookie
        const userData = Cookies.get('user_data');
        return userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (USE_NEXTJS_API) {
      // For Next.js API routes, check for HTTP-only token and user cookies
      const token = Cookies.get('token');
      const userData = Cookies.get('user');
      return !!(token && userData);
    } else {
      // For direct backend calls, check client-side cookies
      const token = Cookies.get('auth_token');
      const userData = Cookies.get('user_data');
      return !!(token && userData);
    }
  },

  // Refresh authentication token
  refreshToken: async () => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/auth/refresh' : '/api/auth/refresh';
      const response = await api.post(endpoint);

      if (!USE_NEXTJS_API && response.data.token) {
        // Update token in cookies for direct backend calls
        Cookies.set('auth_token', response.data.token, { expires: 1 });
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  // Clear all authentication data
  clearAuth: () => {
    if (USE_NEXTJS_API) {
      // Clear Next.js API cookies
      Cookies.remove('token');
      Cookies.remove('user');
    } else {
      // Clear direct backend cookies
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
    }
  }
};

// Key Management API functions
export const keyAPI = {
  // Get all keys (Security and Security-Head only)
  getAllKeys: async (params = {}) => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/proxy/keys' : '/api/keys';
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch keys' };
    }
  },

  // Get user's assigned keys (Faculty only)
  getMyKeys: async () => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/proxy/keys/my' : '/api/keys/my';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch your keys' };
    }
  },

  // Get key by ID
  getKeyById: async (keyId) => {
    try {
      const endpoint = USE_NEXTJS_API ? `/api/proxy/keys/${keyId}` : `/api/keys/${keyId}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch key details' };
    }
  },

  // Get key statistics (Security and Security-Head only)
  getKeyStats: async () => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/proxy/keys/stats' : '/api/keys/stats';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch key statistics' };
    }
  },

  // Create new key (Security-Head only)
  createKey: async (keyData) => {
    try {
      const endpoint = USE_NEXTJS_API ? '/api/proxy/keys' : '/api/keys';
      const response = await api.post(endpoint, keyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create key' };
    }
  },

  // Update key (Security-Head only)
  updateKey: async (keyId, keyData) => {
    try {
      const endpoint = USE_NEXTJS_API ? `/api/proxy/keys/${keyId}` : `/api/keys/${keyId}`;
      const response = await api.put(endpoint, keyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update key' };
    }
  },

  // Assign key to user (Security and Security-Head only)
  assignKey: async (keyId, assignTo, durationHours) => {
    try {
      const endpoint = USE_NEXTJS_API ? `/api/proxy/keys/${keyId}/assign` : `/api/keys/${keyId}/assign`;
      const response = await api.post(endpoint, { assignTo, durationHours });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign key' };
    }
  },

  // Return key (Security and Security-Head only)
  returnKey: async (keyId) => {
    try {
      const endpoint = USE_NEXTJS_API ? `/api/proxy/keys/${keyId}/return` : `/api/keys/${keyId}/return`;
      const response = await api.post(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return key' };
    }
  },

  // Delete key (Security-Head only)
  deleteKey: async (keyId) => {
    try {
      const endpoint = USE_NEXTJS_API ? `/api/proxy/keys/${keyId}` : `/api/keys/${keyId}`;
      const response = await api.delete(endpoint);
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
  },

  // Check API connectivity
  checkConnectivity: async () => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return {
        connected: true,
        status: response.status,
        message: response.data?.message || 'Connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        status: error.response?.status || 0,
        message: error.message || 'Connection failed',
        timestamp: new Date().toISOString(),
        error: error.code
      };
    }
  },

  // Get API configuration info
  getConfig: () => ({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    debugMode: DEBUG_MODE
  })
};

// Enhanced error handling utility
export const handleApiError = (error) => {
  // Network error
  if (!error.response) {
    return {
      success: false,
      error: 'Network error - please check your connection',
      type: 'NETWORK_ERROR',
      code: 'NETWORK_ERROR'
    };
  }

  // Server error with response
  const { status, data } = error.response;

  switch (status) {
    case 400:
      return {
        success: false,
        error: data?.error || data?.message || 'Bad request',
        type: 'VALIDATION_ERROR',
        code: 'BAD_REQUEST',
        details: data?.details
      };
    case 401:
      return {
        success: false,
        error: 'Authentication required - please login again',
        type: 'AUTH_ERROR',
        code: 'UNAUTHORIZED'
      };
    case 403:
      return {
        success: false,
        error: 'Access denied - insufficient permissions',
        type: 'AUTH_ERROR',
        code: 'FORBIDDEN'
      };
    case 404:
      return {
        success: false,
        error: data?.error || 'Resource not found',
        type: 'NOT_FOUND_ERROR',
        code: 'NOT_FOUND'
      };
    case 429:
      return {
        success: false,
        error: 'Too many requests - please try again later',
        type: 'RATE_LIMIT_ERROR',
        code: 'RATE_LIMITED'
      };
    case 500:
      return {
        success: false,
        error: 'Server error - please try again later',
        type: 'SERVER_ERROR',
        code: 'INTERNAL_ERROR'
      };
    default:
      return {
        success: false,
        error: data?.error || data?.message || 'An unexpected error occurred',
        type: 'UNKNOWN_ERROR',
        code: `HTTP_${status}`
      };
  }
};

// API health monitoring
export const apiHealth = {
  // Check if API is reachable
  isHealthy: async () => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return {
        healthy: true,
        status: response.status,
        message: response.data?.message || 'API is healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        status: error.response?.status || 0,
        message: error.message || 'API is unreachable',
        timestamp: new Date().toISOString(),
        error: error.code
      };
    }
  },

  // Get API status with detailed information
  getStatus: async () => {
    try {
      const startTime = Date.now();
      const response = await api.get('/health');
      const responseTime = Date.now() - startTime;

      return {
        status: 'online',
        responseTime,
        server: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'offline',
        error: handleApiError(error),
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Request retry utility with exponential backoff
export const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      if (DEBUG_MODE) {
        console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`);
      }
    }
  }

  throw lastError;
};

// Export the configured axios instance
export default api;
