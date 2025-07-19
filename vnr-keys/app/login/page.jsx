'use client';


import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (formData) => {
    // Simulate login logic
    console.log('Login attempt:', formData);

    // Mock authentication - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock role-based routing
    const mockUser = {
      email: formData.email,
      role: formData.email.includes('security-head') ? 'security-head' :
            formData.email.includes('security') ? 'security' : 'faculty'
    };

    // Store user data (in real app, use proper auth state management)
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Redirect based on role
    switch (mockUser.role) {
      case 'faculty':
        router.push('/faculty');
        break;
      case 'security':
        router.push('/security');
        break;
      case 'security-head':
        router.push('/securityincharage');
        break;
      default:
        router.push('/faculty');
    }
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
