'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, user, isLoading } = useAuth();

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
          router.push('/faculty'); // HOD uses faculty dashboard
          break;
        case 'security_incharge':
          router.push('/securityincharge');
          break;
        default:
          router.push('/faculty');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleRegister = async (formData) => {
    try {
      // Use simplified registration data format
      const userData = {
        userId: formData.userId,
        password: formData.password,
        role: formData.role
      };

      const result = await register(userData);

      if (result.success) {
        // Registration successful - user is automatically authenticated
        // The redirect will be handled by the useEffect above when isAuthenticated becomes true
        console.log('Registration successful:', result.data);
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
