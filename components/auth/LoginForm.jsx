import { useState } from 'react';
import { Mail, Key, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../lib/useAuth';

const LoginForm = ({ onSwitchToRegister }) => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const { login, requestOTP, navigateToDashboard } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await requestOTP(email, 'login');

      if (result.success) {
        setOtpSent(true);
        setStep('otp');
        setMessage('OTP sent to your email. Please check your inbox.');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, otp);

      if (result.success) {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigateToDashboard();
        }, 1000);
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await requestOTP(email, 'login');

      if (result.success) {
        setMessage('New OTP sent to your email');
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setOtpSent(false);
    setError('');
    setMessage('');
  };

  return (
    <Card className="w-full max-w-md mx-auto" padding="lg">
      <div className="text-center mb-6">
        <div className="w-20 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-800 rounded-xl p-2">
          <img
            src="/VNRVJIETLOGO.png"
            alt="VNR VJIET Logo"
            className="w-16 h-12 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'email' ? 'Welcome Back' : 'Enter OTP'}
        </h2>
        <p className="text-gray-600">
          {step === 'email'
            ? 'Sign in to your key management account'
            : `We've sent a verification code to ${email}`
          }
        </p>
      </div>

      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email (e.g., faculty@vnrvjiet.in)"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<Mail className="h-4 w-4" />}
            className="w-full"
            disabled={!email || loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                pattern="[0-9]{6}"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<Key className="h-4 w-4" />}
              className="w-full"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendOTP}
                disabled={loading}
                icon={<RefreshCw className="h-4 w-4" />}
                className="flex-1"
              >
                Resend OTP
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBackToEmail}
                disabled={loading}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="flex-1"
              >
                Change Email
              </Button>
            </div>
          </div>
        </form>
      )}


      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
