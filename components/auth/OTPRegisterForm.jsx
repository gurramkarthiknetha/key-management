import { useState } from 'react';
import { User, Mail, Building, UserCheck, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../lib/useAuth';

const OTPRegisterForm = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    role: 'faculty',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register, verifyOTP, requestOTP } = useAuth();

  const roles = [
    { value: 'faculty', label: 'Faculty' },
    { value: 'security', label: 'Security Personnel' },
    { value: 'hod', label: 'Head of Department' },
    { value: 'security_incharge', label: 'Security Incharge' },
  ];

  const departments = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'General'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@vnrvjiet\.in$/.test(formData.email)) {
      newErrors.email = 'Email must be from vnrvjiet.in domain';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage('');

    try {
      const result = await register(formData);
      
      if (result.success) {
        setStep('verify');
        setMessage('Registration successful! Please check your email for verification code.');
      } else {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await verifyOTP(formData.email, otp, 'email_verification');
      
      if (result.success) {
        setMessage('Email verified successfully! You can now login.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setErrors({ otp: result.error || 'Invalid OTP' });
      }
    } catch (error) {
      setErrors({ otp: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});
    setMessage('');

    try {
      const result = await requestOTP(formData.email, 'email_verification');
      
      if (result.success) {
        setMessage('New verification code sent to your email');
      } else {
        setErrors({ otp: result.error || 'Failed to resend OTP' });
      }
    } catch (error) {
      setErrors({ otp: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep('register');
    setOtp('');
    setErrors({});
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
          {step === 'register' ? 'Create Account' : 'Verify Email'}
        </h2>
        <p className="text-gray-600">
          {step === 'register' 
            ? 'Register for key management system' 
            : `Enter the verification code sent to ${formData.email}`
          }
        </p>
      </div>

      {step === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.name@vnrvjiet.in"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Employee ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.employeeId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your employee ID"
                disabled={loading}
              />
            </div>
            {errors.employeeId && (
              <p className="text-red-600 text-sm mt-1">{errors.employeeId}</p>
            )}
          </div>

          {/* Department Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
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
            icon={<UserCheck className="h-4 w-4" />}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifySubmit} className="space-y-4">
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
            {errors.otp && (
              <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
            )}
          </div>

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
              icon={<CheckCircle className="h-4 w-4" />}
              className="w-full"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendOTP}
                disabled={loading}
                className="flex-1"
              >
                Resend Code
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBackToRegister}
                disabled={loading}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  );
};

export default OTPRegisterForm;
