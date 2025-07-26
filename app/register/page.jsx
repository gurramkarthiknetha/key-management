'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, loading, navigateToDashboard } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('faculty');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Don't redirect immediately - let user see they're already logged in
  // useEffect(() => {
  //   if (session && user && !loading) {
  //     console.log('🔍 RegisterPage: User is authenticated, redirecting...', {
  //       email: user.email,
  //       role: user.role
  //     });
  //     navigateToDashboard();
  //   }
  // }, [session, user, loading, navigateToDashboard]);

  const roleOptions = [
    { value: 'faculty', label: 'Faculty', description: 'Regular faculty member' },
    { value: 'hod', label: 'HOD', description: 'Head of Department' },
    { value: 'security', label: 'Security', description: 'Security staff member' },
    { value: 'security_head', label: 'Security Head', description: 'Security in-charge' },
    { value: 'admin', label: 'Admin', description: 'System administrator' }
  ];

  const handleGoogleSignUp = async () => {
    try {
      setIsSigningIn(true);
      setError(null);

      // Store selected role in multiple places for reliability
      localStorage.setItem('pendingUserRole', selectedRole);
      sessionStorage.setItem('pendingUserRole', selectedRole);

      // Store in a cookie that can be accessed server-side
      document.cookie = `pendingUserRole=${selectedRole}; path=/; max-age=600; SameSite=Lax`; // 10 minutes

      // Also store with a timestamp for cleanup
      const roleData = {
        role: selectedRole,
        timestamp: Date.now(),
        email: null // Will be set after OAuth
      };
      localStorage.setItem('pendingUserRoleData', JSON.stringify(roleData));

      console.log(`🎯 Starting registration with role: ${selectedRole}`);

      await signIn('google', {
        callbackUrl: `/register/complete?role=${selectedRole}&timestamp=${Date.now()}`,
        redirect: true
      });
    } catch (error) {
      console.error('Sign-up error:', error);
      setError('Failed to sign up. Please try again.');
      setIsSigningIn(false);
    }
  };

  const handleRoleSelectionToggle = () => {
    setShowRoleSelection(!showRoleSelection);
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show different content
  if (session && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Already Registered!
            </h2>
            <p className="text-gray-600 mb-8">
              You're already signed in to VNR Key Management
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
            <div className="text-center mb-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-900 mb-2">Current Account:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li><strong>Email:</strong> {user.email}</li>
                  <li><strong>Role:</strong> {user.role}</li>
                  <li><strong>Department:</strong> {user.department}</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={navigateToDashboard}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Go to Dashboard
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join VNR Key Management
          </h2>
          <p className="text-gray-600 mb-8">
            Register with your VNR VJIET Google account
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="space-y-2">
                {roleOptions.map((role) => (
                  <label key={role.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={isSigningIn}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSigningIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Register as {roleOptions.find(r => r.value === selectedRole)?.label}
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center items-center px-4 py-3 border border-green-300 rounded-md shadow-sm bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Already have an account? Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Only VNR VJIET email addresses (@vnrvjiet.in) are allowed.<br/>
              Select your role above and register with your institutional Google account.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Role Descriptions:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Faculty:</strong> Access to assigned laboratory keys and basic features</p>
              <p><strong>HOD:</strong> Department-level management and oversight capabilities</p>
              <p><strong>Security:</strong> Key handover management and monitoring</p>
              <p><strong>Security Head:</strong> Full security operations and staff management</p>
              <p><strong>Admin:</strong> Complete system administration and user management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
