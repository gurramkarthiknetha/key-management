'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuth();

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

  const handleLogin = async (formData) => {
    // Use the userId directly from the form
    const credentials = {
      userId: formData.userId,
      password: formData.password
    };

    const result = await login(credentials);

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

  const handleSwitchToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </div>
  );
}
