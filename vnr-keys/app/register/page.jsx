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
        case 'faculty':
          router.push('/faculty');
          break;
        case 'security':
          router.push('/security');
          break;
        case 'security-head':
          router.push('/securityincharge');
          break;
        default:
          router.push('/faculty');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleRegister = async (formData) => {
    // Convert form data to backend format
    const userData = {
      userId: formData.userId,
      password: formData.password,
      role: formData.role
    };

    const result = await register(userData);

    if (result.success) {
      // Redirect based on role
      switch (result.user.role) {
        case 'faculty':
          router.push('/faculty');
          break;
        case 'security':
          router.push('/security');
          break;
        case 'security-head':
          router.push('/securityincharge');
          break;
        default:
          router.push('/faculty');
      }
    }

    return result;
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
