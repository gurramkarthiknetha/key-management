'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, isAuthenticated, user, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    employeeId: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [hasEmail, setHasEmail] = useState(true); // Track if email is available

  // Get email and employeeId from URL params (passed from registration)
  useEffect(() => {
    const email = searchParams.get('email');
    const employeeId = searchParams.get('employeeId');
    const verificationCode = searchParams.get('verificationCode');

    if (employeeId) {
      setFormData(prev => ({
        ...prev,
        employeeId: decodeURIComponent(employeeId),
        email: email ? decodeURIComponent(email) : '',
        otp: verificationCode ? decodeURIComponent(verificationCode) : ''
      }));
      setHasEmail(!!email);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Redirect based on role
      switch (user.role) {
        case 'faculty_lab_staff':
          router.push('/faculty');
          break;
        case 'security_staff':
          router.push('/security');
          break;
        case 'hod':
          router.push('/faculty');
          break;
        case 'security_incharge':
          router.push('/securityincharge');
          break;
        default:
          router.push('/faculty');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields based on whether email is available
    if (!formData.employeeId || !formData.otp) {
      setError('Employee ID and OTP are required');
      return;
    }

    if (hasEmail && !formData.email) {
      setError('Email is required');
      return;
    }

    if (formData.otp.length < 5 || formData.otp.length > 6) {
      setError('OTP must be 5-6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verificationData = {
        employeeId: formData.employeeId,
        otp: formData.otp
      };

      // Only include email if it's available
      if (formData.email) {
        verificationData.email = formData.email;
      }

      const result = await verifyOTP(verificationData);

      if (result.success) {
        // Verification successful, user will be redirected by useEffect
        // The verifyOTP function should set the user as authenticated
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.employeeId) {
      setError('Employee ID is required to resend OTP');
      return;
    }

    if (hasEmail && !formData.email) {
      setError('Email is required to resend OTP');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      // You might want to implement a resend OTP endpoint
      // For now, we'll show a message
      if (hasEmail) {
        setError('Please contact support to resend OTP to your email');
      } else {
        setError('Please contact support to get a new OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {hasEmail ? 'Enter the 6-digit OTP sent to your email' : 'Enter the 6-digit OTP provided during registration'}
          </p>
          {formData.email && (
            <p className="mt-1 text-center text-sm text-primary-600">
              {formData.email}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {hasEmail && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={hasEmail}
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                value={formData.employeeId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your employee ID"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                placeholder="000000"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
            
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
