'use client';

import { useRouter } from 'next/navigation';
import { Key, Shield, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Button, Card } from '../components/ui';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <Key className="h-8 w-8" />,
      title: 'Key Management',
      description: 'Efficiently manage and track all laboratory keys with QR code technology.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Security Control',
      description: 'Secure access control with role-based permissions and real-time monitoring.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'User Management',
      description: 'Manage faculty, security personnel, and administrative users seamlessly.'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting for key usage and security insights.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">VNR</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Key Management</span>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Key Management
            <span className="block text-primary-600">for VNR College</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline laboratory access with our QR-based key management system.
            Secure, efficient, and designed for educational institutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/login')}
              icon={<ArrowRight className="h-5 w-5" />}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center" padding="lg" hover>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Role-based Access */}
          <div className="bg-white rounded-3xl p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Role-Based Access Control
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Faculty</h3>
                <p className="text-sm text-gray-600">
                  View assigned keys, generate QR codes, and share access with colleagues.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-600">
                  Monitor key status, handle handovers, and track key movements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin</h3>
                <p className="text-sm text-gray-600">
                  Full system control, analytics, user management, and reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">
            © 2024 VNR Key Management System. Built for educational excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
