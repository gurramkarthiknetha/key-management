'use client';

import { useRouter } from 'next/navigation';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (formData) => {
    // Simulate registration logic
    console.log('Registration attempt:', formData);

    // Mock registration - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // After successful registration, redirect to login
    router.push('/login');
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
