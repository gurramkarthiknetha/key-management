'use client';

// Global error handler for API calls and application errors
class GlobalErrorHandler {
  constructor() {
    this.errorListeners = new Set();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        this.handleError(event.reason, 'UNHANDLED_REJECTION');
        event.preventDefault();
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        console.error('JavaScript error:', event.error);
        this.handleError(event.error, 'JAVASCRIPT_ERROR');
      });
    }
  }

  // Add error listener
  addErrorListener(callback) {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  // Handle different types of errors
  handleError(error, type = 'UNKNOWN', context = {}) {
    const errorInfo = this.categorizeError(error, type, context);
    
    // Log error
    console.error('Global Error Handler:', errorInfo);

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });

    // Handle specific error types
    this.handleSpecificError(errorInfo);
  }

  categorizeError(error, type, context) {
    const baseInfo = {
      timestamp: new Date().toISOString(),
      type,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    if (error?.response) {
      // API Error
      return {
        ...baseInfo,
        category: 'API_ERROR',
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.error || error.message,
        requestId: error.response.data?.requestId,
        data: error.response.data
      };
    } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      // Network Error
      return {
        ...baseInfo,
        category: 'NETWORK_ERROR',
        message: 'Network connection failed',
        originalMessage: error.message
      };
    } else if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      // Fetch Error
      return {
        ...baseInfo,
        category: 'FETCH_ERROR',
        message: 'Failed to fetch data',
        originalMessage: error.message
      };
    } else if (error instanceof Error) {
      // JavaScript Error
      return {
        ...baseInfo,
        category: 'JAVASCRIPT_ERROR',
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      // Unknown Error
      return {
        ...baseInfo,
        category: 'UNKNOWN_ERROR',
        message: typeof error === 'string' ? error : 'An unknown error occurred',
        originalError: error
      };
    }
  }

  handleSpecificError(errorInfo) {
    switch (errorInfo.category) {
      case 'API_ERROR':
        this.handleApiError(errorInfo);
        break;
      case 'NETWORK_ERROR':
        this.handleNetworkError(errorInfo);
        break;
      case 'JAVASCRIPT_ERROR':
        this.handleJavaScriptError(errorInfo);
        break;
      default:
        this.handleGenericError(errorInfo);
    }
  }

  handleApiError(errorInfo) {
    const { status, message } = errorInfo;

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        this.showNotification('Session expired. Please log in again.', 'error');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 2000);
        break;
      case 403:
        // Forbidden
        this.showNotification('Access denied. You don\'t have permission for this action.', 'error');
        break;
      case 404:
        // Not found
        this.showNotification('The requested resource was not found.', 'warning');
        break;
      case 429:
        // Rate limited
        this.showNotification('Too many requests. Please try again later.', 'warning');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        this.showNotification('Server error. Please try again later.', 'error');
        break;
      default:
        this.showNotification(message || 'An error occurred', 'error');
    }
  }

  handleNetworkError(errorInfo) {
    this.showNotification('Network connection failed. Please check your internet connection.', 'error');
  }

  handleJavaScriptError(errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      this.showNotification(`JavaScript Error: ${errorInfo.message}`, 'error');
    } else {
      this.showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    }
  }

  handleGenericError(errorInfo) {
    this.showNotification(errorInfo.message || 'An unexpected error occurred', 'error');
  }

  showNotification(message, type = 'info') {
    // This can be customized to integrate with your notification system
    if (typeof window !== 'undefined') {
      // Try to use browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Key Management System', {
          body: message,
          icon: '/favicon.ico'
        });
      }

      // Emit custom event for in-app notifications
      window.dispatchEvent(new CustomEvent('app:notification', {
        detail: { message, type, timestamp: new Date().toISOString() }
      }));
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Notification [${type}]:`, message);
    }
  }

  // Utility methods for manual error reporting
  reportApiError(error, context) {
    this.handleError(error, 'API_ERROR', context);
  }

  reportNetworkError(error, context) {
    this.handleError(error, 'NETWORK_ERROR', context);
  }

  reportJavaScriptError(error, context) {
    this.handleError(error, 'JAVASCRIPT_ERROR', context);
  }

  // Method to clear all listeners (useful for cleanup)
  clearAllListeners() {
    this.errorListeners.clear();
  }
}

// Create singleton instance
const globalErrorHandler = new GlobalErrorHandler();

// React hook for using the error handler
export const useErrorHandler = () => {
  const [errors, setErrors] = React.useState([]);

  React.useEffect(() => {
    const removeListener = globalErrorHandler.addErrorListener((errorInfo) => {
      setErrors(prev => [...prev.slice(-9), errorInfo]); // Keep last 10 errors
    });

    return removeListener;
  }, []);

  const clearErrors = () => setErrors([]);
  
  const reportError = (error, type, context) => {
    globalErrorHandler.handleError(error, type, context);
  };

  return {
    errors,
    clearErrors,
    reportError,
    reportApiError: globalErrorHandler.reportApiError.bind(globalErrorHandler),
    reportNetworkError: globalErrorHandler.reportNetworkError.bind(globalErrorHandler),
    reportJavaScriptError: globalErrorHandler.reportJavaScriptError.bind(globalErrorHandler)
  };
};

export default globalErrorHandler;
