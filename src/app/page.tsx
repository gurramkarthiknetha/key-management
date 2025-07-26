'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LoginForm from '@/components/forms/LoginForm';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'faculty':
          router.push('/faculty');
          break;
        case 'security':
          router.push('/security');
          break;
        case 'security_incharge':
          router.push('/security');
          break;
        case 'hod':
          router.push('/hod');
          break;
        default:
          router.push('/faculty');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Key Management System
          </h1>
          <p className="text-gray-600">
            Secure access control for educational institutions
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 Key Management System. All rights reserved.</p>
      </div>
    </div>
  );
}
