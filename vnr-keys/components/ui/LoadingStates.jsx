'use client';

import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

// Basic loading spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Full page loading
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" className="text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

// Section loading
export const SectionLoading = ({ message = 'Loading...', className = '' }) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <LoadingSpinner size="lg" className="text-blue-600 mr-3" />
    <span className="text-gray-600">{message}</span>
  </div>
);

// Card loading skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-300 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-300 rounded flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Button loading state
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '',
  ...props 
}) => (
  <button
    disabled={loading || disabled}
    className={`relative ${className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    {...props}
  >
    {loading && (
      <LoadingSpinner size="sm" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    )}
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {children}
    </span>
  </button>
);

// Error states
export const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  className = '' 
}) => (
  <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-red-800 font-medium mb-1">{title}</h4>
        {message && <p className="text-red-600 text-sm mb-3">{message}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Page error
export const PageError = ({ 
  title = 'Page Error', 
  message = 'Something went wrong while loading this page.', 
  onRetry,
  onGoBack 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center max-w-md mx-auto">
      <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="space-x-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  </div>
);

// Empty state
export const EmptyState = ({ 
  title = 'No data found', 
  message, 
  icon: Icon,
  action,
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    {Icon && (
      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {message && <p className="text-gray-600 mb-6">{message}</p>}
    {action}
  </div>
);

// Network error
export const NetworkError = ({ onRetry }) => (
  <ErrorMessage
    title="Network Error"
    message="Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

// Unauthorized error
export const UnauthorizedError = ({ onLogin }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-yellow-800 font-medium mb-1">Authentication Required</h4>
        <p className="text-yellow-600 text-sm mb-3">You need to log in to access this content.</p>
        {onLogin && (
          <button
            onClick={onLogin}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
          >
            Log in
          </button>
        )}
      </div>
    </div>
  </div>
);
