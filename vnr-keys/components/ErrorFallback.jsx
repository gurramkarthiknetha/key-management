'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './ui';

// Generic error fallback component
export const ErrorFallback = ({ 
  error, 
  resetError, 
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showDetails = false 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>

      <div className="flex gap-3">
        <Button onClick={resetError} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>

      {showDetails && error && process.env.NODE_ENV === 'development' && (
        <details className="mt-6 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
            Error Details (Development)
          </summary>
          <div className="bg-red-50 border border-red-200 rounded p-4 text-left">
            <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

// Specific error fallbacks for different scenarios
export const NetworkErrorFallback = ({ resetError }) => (
  <ErrorFallback
    title="Connection Problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    resetError={resetError}
  />
);

export const AuthErrorFallback = ({ resetError }) => (
  <ErrorFallback
    title="Authentication Required"
    description="Your session has expired. Please log in again to continue."
    resetError={() => window.location.href = '/login'}
  />
);

export const NotFoundErrorFallback = ({ resetError }) => (
  <ErrorFallback
    title="Page Not Found"
    description="The page you're looking for doesn't exist or has been moved."
    resetError={() => window.location.href = '/'}
  />
);

export const PermissionErrorFallback = ({ resetError }) => (
  <ErrorFallback
    title="Access Denied"
    description="You don't have permission to access this resource."
    resetError={resetError}
  />
);

// Error boundary wrapper for specific components
export const ComponentErrorBoundary = ({ children, fallback: Fallback = ErrorFallback }) => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setError(event.error);
    };

    const handleUnhandledRejection = (event) => {
      setError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return <Fallback error={error} resetError={resetError} />;
  }

  return children;
};

export default ErrorFallback;
