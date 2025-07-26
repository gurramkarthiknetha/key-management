'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/useAuth';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Unauthorized component
const UnauthorizedAccess = ({ requiredRole, userRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <div className="text-sm text-gray-500 mb-6">
        <p>Required role: <span className="font-semibold">{Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}</span></p>
        <p>Your role: <span className="font-semibold">{userRole || 'None'}</span></p>
      </div>
      <button
        onClick={() => window.history.back()}
        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = null,
  redirectTo = '/login',
  fallback = null 
}) => {
  const { data: session, status } = useSession();
  const { user, loading, hasRole, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Auth state check:', {
      session: !!session,
      status,
      loading,
      userRole: user?.role,
      requiredRole,
      requiredRoles,
      userEmail: user?.email
    });

    // Don't redirect while loading
    if (status === 'loading' || loading) {
      console.log('🛡️ ProtectedRoute: Still loading, waiting...');
      return;
    }

    // Redirect to login if not authenticated
    if (!session || !user) {
      console.log('🛡️ ProtectedRoute: Not authenticated, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // Check role requirements using user.role directly to avoid function dependencies
    if (requiredRole && user?.role !== requiredRole) {
      console.log('🛡️ ProtectedRoute: Role check failed for single role:', {
        userRole: user?.role,
        requiredRole
      });
      return;
    }

    if (requiredRoles && !requiredRoles.includes(user?.role)) {
      console.log('🛡️ ProtectedRoute: Role check failed for multiple roles:', {
        userRole: user?.role,
        requiredRoles,
        includes: requiredRoles.includes(user?.role)
      });
      return;
    }

    console.log('🛡️ ProtectedRoute: All checks passed, rendering content');
  }, [session, status, loading, user?.role, requiredRole, requiredRoles, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (status === 'loading' || loading) {
    return fallback || <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!session || !user) {
    return null; // Will redirect in useEffect
  }

  // Check role requirements
  const roleToCheck = requiredRoles || requiredRole;
  if (roleToCheck) {
    const hasRequiredRole = requiredRoles 
      ? hasAnyRole(requiredRoles) 
      : hasRole(requiredRole);

    if (!hasRequiredRole) {
      return <UnauthorizedAccess requiredRole={roleToCheck} userRole={user?.role} />;
    }
  }

  // Render children if all checks pass
  return children;
};

// Higher-order component for protecting pages
export const withAuth = (WrappedComponent, options = {}) => {
  const AuthenticatedComponent = (props) => {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

// Role-specific protected route components
export const FacultyRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={["faculty", "hod"]} {...props}>
    {children}
  </ProtectedRoute>
);

export const SecurityRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['security', 'security_head']} {...props}>
    {children}
  </ProtectedRoute>
);

export const SecurityHeadRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="security_head" {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const HODRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="hod" {...props}>
    {children}
  </ProtectedRoute>
);

export const AnyAuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
