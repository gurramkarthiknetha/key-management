'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  // Check for registration success message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'registration-success') {
      setShowRegistrationSuccess(true);
      // Clear the URL parameter
      router.replace('/login');
    }
  }, [searchParams, router]);

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if we're sure the user is authenticated and not loading
    if (isAuthenticated && user && !isLoading) {
      console.log('🔍 LoginPage: User is authenticated, redirecting...', {
        userId: user.userId,
        role: user.role
      });

      // Use router.push instead of window.location.href for better UX
      let targetUrl;
      switch (user.role) {
        case 'faculty':
        case 'faculty_lab_staff':
          targetUrl = '/faculty';
          break;
        case 'security_staff':
          targetUrl = '/security';
          break;
        case 'hod':
          targetUrl = '/faculty'; // HOD uses faculty dashboard
          break;
        case 'security_incharge':
          targetUrl = '/securityincharge';
          break;
        default:
          targetUrl = '/faculty';
      }

      console.log('🔍 LoginPage: Redirecting to:', targetUrl);
      router.push(targetUrl);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogin = async (formData) => {
    console.log('🔐 LoginPage: handleLogin called with:', formData);

    // Use the userId directly from the form
    const credentials = {
      userId: formData.userId,
      password: formData.password
    };

    console.log('🔐 LoginPage: Calling AuthContext login...');
    const result = await login(credentials);
    console.log('🔐 LoginPage: AuthContext login result:', result);

    if (result.success) {
      console.log('🔐 LoginPage: Login successful, attempting navigation for role:', result.user.role);

      // Use window.location.href for hard navigation to avoid router conflicts
      let targetUrl;
      switch (result.user.role) {
        case 'faculty_lab_staff':
          targetUrl = '/faculty';
          break;
        case 'security_staff':
          targetUrl = '/security';
          break;
        case 'hod':
          targetUrl = '/faculty'; // HOD uses faculty dashboard
          break;
        case 'security_incharge':
          targetUrl = '/securityincharge';
          break;
        default:
          targetUrl = '/faculty';
      }

      console.log('🔐 LoginPage: Hard navigating to:', targetUrl);
      window.location.href = targetUrl;
    } else {
      console.log('🔐 LoginPage: Login failed:', result.error);
    }

    return result;
  };

  const handleSwitchToRegister = () => {
    router.push('/register');
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {showRegistrationSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Registration successful! Please check your email for verification.</span>
            <button
              onClick={() => setShowRegistrationSuccess(false)}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </div>
  );
}
