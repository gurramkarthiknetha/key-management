"use client";

import { useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import LoginForm from '../../components/auth/LoginForm';
import OTPRegisterForm from '../../components/auth/OTPRegisterForm';
import ConnectionTest from '../../components/ConnectionTest';

export default function TestAuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Authentication Test</h1>
            <p className="text-green-600 mt-2">✅ Successfully Authenticated!</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">User Information:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Department:</span> {user.department}</p>
                <p><span className="font-medium">Employee ID:</span> {user.employeeId}</p>
                <p><span className="font-medium">Email Verified:</span> {user.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/faculty'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={logout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Test</h1>
          <p className="text-gray-600 mt-2">Test the new OTP-based authentication system</p>
        </div>

        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <OTPRegisterForm onSwitchToLogin={() => setMode('login')} />
        )}

        <div className="mt-8 space-y-6">
          <ConnectionTest />

          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>1. Verify backend connection above</p>
                <p>2. Register with a @vnrvjiet.in email</p>
                <p>3. Check email for OTP verification</p>
                <p>4. Login using email + OTP</p>
                <p>5. Test role-based access control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
