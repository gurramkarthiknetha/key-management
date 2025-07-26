'use client';

import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';

export default function RegisterCompletePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, navigateToDashboard, getDashboardUrl } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const completeRegistration = async () => {
      if (status === 'loading' || loading) return;

      try {
        if (!session) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/register'), 2000);
          return;
        }

        // Get the selected role from various sources
        const roleFromUrl = searchParams.get('role');
        const roleFromStorage = localStorage.getItem('pendingUserRole') || sessionStorage.getItem('pendingUserRole');

        // Try to get from stored data with timestamp
        let roleFromData = null;
        try {
          const storedData = localStorage.getItem('pendingUserRoleData');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            // Check if data is not too old (within 10 minutes)
            if (Date.now() - parsed.timestamp < 600000) {
              roleFromData = parsed.role;
            }
          }
        } catch (e) {
          console.warn('Failed to parse stored role data:', e);
        }

        const selectedRole = roleFromUrl || roleFromData || roleFromStorage || 'faculty';

        console.log('🎯 Registration completion:', {
          email: session.user.email,
          selectedRole,
          roleFromUrl,
          roleFromStorage,
          roleFromData,
          sessionRole: session.user.role
        });

        // Store the selected role in the user's profile BEFORE navigation
        const updateResult = await updateUserRole(session.user.email, selectedRole);

        if (updateResult.success) {
          console.log('✅ Role successfully updated to:', selectedRole);

          // Clean up stored role data
          localStorage.removeItem('pendingUserRole');
          sessionStorage.removeItem('pendingUserRole');
          localStorage.removeItem('pendingUserRoleData');
          document.cookie = 'pendingUserRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

          // Force a session refresh to get the updated role
          console.log('🔄 Triggering session refresh...');

          // Method 1: Use NextAuth's update function to trigger JWT refresh
          await update({ trigger: 'update' });

          // Method 2: Call our custom refresh endpoint
          try {
            await fetch('/api/auth/refresh', { method: 'POST' });
          } catch (e) {
            console.warn('Custom refresh failed:', e);
          }

          // Method 3: Force getSession to refresh
          await getSession();

          // Method 4: Multiple attempts to ensure session is updated
          let attempts = 0;
          const maxAttempts = 5;

          const checkSessionUpdate = async () => {
            const freshSession = await getSession();
            console.log(`🔍 Session check attempt ${attempts + 1}:`, {
              role: freshSession?.user?.role,
              expected: selectedRole
            });

            if (freshSession?.user?.role === selectedRole) {
              console.log('✅ Session updated successfully');
              setIsProcessing(false);
              navigateToDashboard();
            } else if (attempts >= maxAttempts) {
              console.log('⚠️ Max attempts reached, forcing page reload to refresh session');
              // As a last resort, reload the page to force session refresh
              window.location.href = getDashboardUrl(selectedRole);
            } else {
              attempts++;
              setTimeout(checkSessionUpdate, 500);
            }
          };

          // Start checking after a brief delay
          setTimeout(checkSessionUpdate, 1000);
        } else {
          throw new Error('Failed to update user role');
        }

      } catch (error) {
        console.error('Registration completion error:', error);
        setError('Failed to complete registration. Please try again.');
        setIsProcessing(false);
      }
    };

    completeRegistration();
  }, [session, status, loading, searchParams, router, navigateToDashboard]);

  const updateUserRole = async (email, role) => {
    try {
      console.log(`🔄 Updating role for ${email} to ${role}`);

      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Role update failed:', result);
        throw new Error(result.error || 'Failed to update user role');
      }

      console.log('✅ Role update successful:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      return { success: false, error: error.message };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
            <div className="mx-auto h-20 w-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <div className="mx-auto h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            ) : (
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isProcessing ? 'Completing Registration...' : 'Registration Complete!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isProcessing 
              ? 'Please wait while we set up your account with the selected role.'
              : 'Your account has been created successfully. Redirecting to your dashboard...'
            }
          </p>

          {session && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Role:</strong> {searchParams.get('role') || 'Faculty'}</p>
              </div>
            </div>
          )}

          {!isProcessing && (
            <button
              onClick={navigateToDashboard}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
