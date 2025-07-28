'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import SimpleAuthForm from '../../components/auth/SimpleAuthForm';

function LoginContent() {
  const { user, isAuthenticated, loading, navigateToDashboard } = useAuth();
  const searchParams = useSearchParams();
  const switchRole = searchParams.get('switch');

  // Note: Automatic redirect is disabled since SimpleAuthForm handles role-based redirects
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     console.log('🔍 LoginPage: User is authenticated, redirecting to dashboard...', {
  //       email: user.email,
  //       role: user.role
  //     });
  //     navigateToDashboard();
  //   }
  // }, [isAuthenticated, user, navigateToDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return <SimpleAuthForm switchRole={switchRole} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
