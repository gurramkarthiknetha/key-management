'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { Button, Card } from '../../components/ui';
import { ArrowRight, Mail, Shield, Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user, navigateToDashboard } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔍 RegisterPage: User is authenticated, redirecting...', {
        email: user.email,
        role: user.role
      });
      navigateToDashboard();
    }
  }, [isAuthenticated, user, navigateToDashboard]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center" padding="lg">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">VNR</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to VNR Key Management
          </h1>

          <p className="text-gray-600 mb-8">
            No registration required! Simply login with your VNR VJIET email address.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Auto-Registration</h3>
                <p className="text-sm text-gray-600">Your account is created automatically when you first login</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Role-Based Access</h3>
                <p className="text-sm text-gray-600">Your role is determined by your email domain</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instant Access</h3>
                <p className="text-sm text-gray-600">Start using the system immediately after login</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/login')}
            icon={<ArrowRight className="h-5 w-5" />}
            className="w-full"
          >
            Continue to Login
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Use your @vnrvjiet.in email address to get started
          </p>
        </Card>
      </div>
    </div>
  );
}
