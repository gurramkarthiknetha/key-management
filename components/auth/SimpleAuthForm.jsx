'use client';

import { useState, useEffect } from 'react';

// Simple API functions for authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

const simpleAuth = async (email) => {
  return await apiRequest('/auth/simple-auth', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

const login = async (email, otp) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

  // Store the token in localStorage and cookies for persistence
  if (response.data && response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Set cookie for server-side authentication
    document.cookie = `authToken=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  return response;
};

export default function SimpleAuthForm({ switchRole }) {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear any existing auth state when switching roles
  useEffect(() => {
    if (switchRole) {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, [switchRole]);

  // Available roles for selection
  const roleOptions = [
    { value: 'faculty', label: 'Faculty', description: 'Access lab keys and manage department resources' },
    { value: 'hod', label: 'Head of Department', description: 'Manage department keys and faculty access' },
    { value: 'security', label: 'Security Personnel', description: 'Monitor key movements and handle handovers' },
    { value: 'security_incharge', label: 'Security Incharge', description: 'Full security management and oversight' },
    { value: 'admin', label: 'Administrator', description: 'Complete system administration and user management' }
  ];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate email format
      if (!email.endsWith('@vnrvjiet.in')) {
        throw new Error('Please use your VNR VJIET email address (@vnrvjiet.in)');
      }

      // Send OTP using simplified auth endpoint
      const response = await simpleAuth(email);

      setUserInfo(response.data);
      setStep('otp');
      const roleName = roleOptions.find(r => r.value === selectedRole)?.label || selectedRole;
      setSuccess(`Login code sent to ${email}. You'll be logged in as ${roleName}.`);
    } catch (error) {
      if (error.message.includes('Too many authentication attempts')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError(error.message || 'Failed to send login code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify OTP and login
      const response = await login(email, otp);

      setSuccess('Login successful! Redirecting...');

      // Redirect based on selected role (or fallback to user role)
      const user = response.data.user;
      const roleToUse = selectedRole || user.role;
      let redirectPath = '/';

      switch (roleToUse) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'hod':
          redirectPath = '/hod';
          break;
        case 'faculty':
          redirectPath = '/faculty';
          break;
        case 'security':
          redirectPath = '/security';
          break;
        case 'security_incharge':
          redirectPath = '/securityincharge';
          break;
        default:
          redirectPath = '/faculty'; // Default to faculty dashboard
      }

      // Wait a moment for token storage to complete, then redirect
      setTimeout(() => {
        console.log('🚀 SimpleAuthForm: Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      }, 200);
    } catch (error) {
      if (error.message.includes('Too many authentication attempts')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError(error.message || 'Invalid code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      await simpleAuth(email);
      setSuccess('New login code sent to your email!');
    } catch (error) {
      setError(error.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4.5S9 7 12 7a6 6 0 016 6zM9 7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            VNR Key Management
          </h2>
          <p className="text-secondary mb-8">
            {step === 'email'
              ? 'Enter your VNR VJIET email to get started'
              : 'Enter the code sent to your email'
            }
          </p>

          {switchRole && step === 'email' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-blue-700 font-medium">
                  You've been logged out to switch roles. Please select your new role below and login again.
                </p>
              </div>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && step === 'email' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-green-700 font-medium">
                  <strong>Development Mode:</strong> Role switching enabled! You can access any role dashboard regardless of your account type.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-green-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  VNR VJIET Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@vnrvjiet.in"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter your @vnrvjiet.in email address
                </p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Role
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose your role...</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {selectedRole && (
                  <p className="mt-1 text-xs text-gray-600">
                    {roleOptions.find(r => r.value === selectedRole)?.description}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email || !selectedRole}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Send Login Code'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {userInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Login Details:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Email:</strong> {userInfo.email}</li>
                    <li><strong>Name:</strong> {userInfo.name}</li>
                    <li><strong>Selected Role:</strong> {roleOptions.find(r => r.value === selectedRole)?.label}</li>
                    <li><strong>Dashboard:</strong> /{selectedRole}</li>
                  </ul>
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="flex space-x-3">
                <button
                  onClick={handleBackToEmail}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Only VNR VJIET email addresses (@vnrvjiet.in) are allowed.<br/>
              Your role and department will be automatically assigned based on your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
