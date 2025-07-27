'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, navigateToDashboard } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  // Don't redirect immediately - let user see they're already logged in
  // useEffect(() => {
  //   if (session && user && !loading) {
  //     console.log('🔍 LoginPage: User is authenticated, redirecting...', {
  //       email: user.email,
  //       role: user.role
  //     });
  //     navigateToDashboard();
  //   }
  // }, [session, user, loading, navigateToDashboard]);
  // Handle OAuth error from URL params

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no_role') {
      setError('No role assigned to your account. Please use the "Assign Role Automatically" button below.');
    } else if (error === 'access_denied') {
      setError('Access denied. You do not have permission to access that page.');
    } else if (error) {
      setError('Authentication failed. Please make sure you are using a VNR VJIET email address.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signIn('google', {
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  };

  const handleAssignRole = async () => {
    try {
      setIsAssigningRole(true);
      setError(null);

      const response = await fetch('/api/fix/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Auto-assign based on email
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the page to get updated session
        window.location.reload();
      } else {
        setError(data.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Role assignment error:', error);
      setError('Failed to assign role. Please try again.');
    } finally {
      setIsAssigningRole(false);
    }
  };


  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated
  if (session && user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Already Signed In!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              You're already logged in to VNR Key Management
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
            <div className="text-center mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Account:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li><strong>Email:</strong> {user.email}</li>
                  <li><strong>Role:</strong> {user.role}</li>
                  <li><strong>Department:</strong> {user.department}</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {/* <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role || 'Not assigned'}</p>
                <p><strong>Department:</strong> {user?.department || 'Not assigned'}</p>
                <p><strong>Session Status:</strong> {status}</p>
              </div> */}

              <button
                onClick={() => {
                  window.location.href = '/redirect-dashboard';
                }}
                className="w-full flex justify-center items-center px-4 py-3 rounded-md 
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  text-white font-medium text-sm
                  shadow-sm hover:shadow-md
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => router.push('/register')}
                className="w-full flex justify-center items-center px-4 py-3 rounded-md
                  bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                  text-gray-900 dark:text-white font-medium text-sm
                  border border-gray-300 dark:border-gray-600
                  shadow-sm hover:shadow-md
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Register Page
              </button>

              {!user?.role && (
                <div className="space-y-2">
                  <button
                    onClick={handleAssignRole}
                    disabled={isAssigningRole}
                    className="w-full flex justify-center items-center px-4 py-3 rounded-md
                      bg-green-50 dark:bg-green-900/50 
                      hover:bg-green-100 dark:hover:bg-green-800/50
                      text-green-700 dark:text-green-100 font-medium text-sm
                      border border-green-300 dark:border-green-800
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {isAssigningIn ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                      'Assign Role Automatically'
                    )}
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center items-center px-4 py-3 rounded-md
                      bg-yellow-50 dark:bg-yellow-900/50
                      hover:bg-yellow-100 dark:hover:bg-yellow-800/50
                      text-yellow-700 dark:text-yellow-100 font-medium text-sm
                      border border-yellow-300 dark:border-yellow-800
                      transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Refresh Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login form for unauthenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4.5S9 7 12 7a6 6 0 016 6zM9 7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            VNR Key Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Sign in with your VNR VJIET Google account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="error-message mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex justify-center items-center px-4 py-3 rounded-md
              bg-surface text-sm font-medium text-primary
              border border-border
              hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSigningIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-gray-500">
              Only VNR VJIET email addresses (@vnrvjiet.in) are allowed
            </p>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
