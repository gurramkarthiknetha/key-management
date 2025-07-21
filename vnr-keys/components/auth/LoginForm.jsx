import { useState } from 'react';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../lib/useAuth';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { error: authError, clearError } = useAuth();

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
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'User ID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 LoginForm: Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('📝 LoginForm: Form validation failed');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 LoginForm: Calling onLogin callback...');
      const result = await onLogin(formData);
      console.log('📝 LoginForm: onLogin result:', result);

      if (!result.success) {
        console.log('📝 LoginForm: Login failed:', result.error);
        setErrors({ submit: result.error || 'Login failed' });
      } else {
        console.log('📝 LoginForm: Login successful, should navigate now');
      }
    } catch (error) {
      console.log('📝 LoginForm: Login error caught:', error);
      setErrors({ submit: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" padding="lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">VNR</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">
          Sign in to your key management account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User ID Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.userId ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your user ID (e.g., faculty001)"
            />
          </div>
          {errors.userId && (
            <p className="text-red-600 text-sm mt-1">{errors.userId}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit Error */}
        {(errors.submit || authError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit || authError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<LogIn className="h-4 w-4" />}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      {/* Test Credentials Helper */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">Test Credentials:</p>
        <div className="space-y-1 text-xs text-blue-700">
          <button
            type="button"
            onClick={() => setFormData({ userId: 'faculty001', password: 'password123' })}
            className="block w-full text-left hover:bg-blue-100 p-1 rounded"
          >
            Faculty: faculty001 / password123
          </button>
          <button
            type="button"
            onClick={() => setFormData({ userId: 'security001', password: 'password123' })}
            className="block w-full text-left hover:bg-blue-100 p-1 rounded"
          >
            Security: security001 / password123
          </button>
          <button
            type="button"
            onClick={() => setFormData({ userId: 'sechead001', password: 'password123' })}
            className="block w-full text-left hover:bg-blue-100 p-1 rounded"
          >
            Security Head: sechead001 / password123
          </button>
        </div>
      </div>

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
