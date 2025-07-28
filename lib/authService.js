/**
 * Authentication Service for OTP-based authentication
 * Handles communication with the backend authentication server
 */

class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:5000/api';
    this.token = null;
    this.user = null;

    // Log the API URL for debugging
    console.log('🔗 Auth Service initialized with API URL:', this.baseURL);
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    console.log(`🌐 Making API request to: ${url}`);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      credentials: 'include', // Include cookies for CORS
      mode: 'cors', // Enable CORS
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`📤 Request config:`, {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        hasBody: !!config.body
      });

      const response = await fetch(url, config);

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📋 Response data:`, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simplified authentication - auto-register and send OTP with just email
   */
  async simpleAuth(email) {
    try {
      const response = await this.apiRequest('/auth/simple-auth', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Request OTP for login or other purposes
   */
  async requestOTP(email, purpose = 'login') {
    try {
      const response = await this.apiRequest('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      });

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp, purpose = 'email_verification') {
    try {
      const response = await this.apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, purpose }),
      });

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login with OTP
   */
  async login(email, otp) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      if (response.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        
        // Store token in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      this.token = null;
      this.user = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    return { success: true };
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const response = await this.apiRequest('/auth/me');
      
      if (response.success) {
        this.user = response.data.user;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await this.apiRequest('/auth/refresh', {
        method: 'POST',
      });

      if (response.success) {
        this.token = response.data.token;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', this.token);
        }
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await this.apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, password: newPassword }),
      });

      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const response = await this.apiRequest('/auth/validate-session');
      
      if (response.success && response.isAuthenticated) {
        this.user = response.data.user;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return {
        success: response.success,
        isAuthenticated: response.isAuthenticated,
        user: response.data?.user,
      };
    } catch (error) {
      return {
        success: false,
        isAuthenticated: false,
        error: error.message,
      };
    }
  }

  /**
   * Initialize auth service (load token from storage)
   */
  initialize() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        this.token = storedToken;
      }
      
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    if (!this.user?.role || !Array.isArray(roles)) return false;
    return roles.includes(this.user.role);
  }

  /**
   * Get dashboard URL for current user
   */
  getDashboardUrl() {
    if (!this.user?.role) return '/';
    
    const dashboardUrls = {
      'faculty': '/faculty',
      'security': '/security',
      'hod': '/hod',
      'security_incharge': '/securityincharge',
      'admin': '/admin'
    };

    return dashboardUrls[this.user.role] || '/';
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize on import
if (typeof window !== 'undefined') {
  authService.initialize();
}

export default authService;
