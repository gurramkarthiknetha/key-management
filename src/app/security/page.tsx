'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/lib/auth-context';
import { User, LogOut, Key, Clock, Shield, QrCode, Users } from 'lucide-react';

export default function SecurityDashboard() {
  const { data: session } = useSession();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has security role
    if (user && !['security', 'security_incharge'].includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      window.location.href = user.role === 'faculty' ? '/faculty' : 
                            user.role === 'hod' ? '/hod' : '/faculty';
    }
    setLoading(false);
  }, [user]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentUser = user || session?.user;
  const isSecurityIncharge = (currentUser as any)?.role === 'security_incharge';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isSecurityIncharge ? 'Security Incharge Dashboard' : 'Security Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Key Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-gray-600">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome, {currentUser?.name}!
              </h2>
              <p className="text-gray-600">
                You are logged in as a <span className="font-semibold text-red-600">
                  {isSecurityIncharge ? 'Security Incharge' : 'Security Staff'}
                </span> member 
                from the <span className="font-semibold">{(currentUser as any)?.department}</span> department.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Keys
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        45
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Keys in Use
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        12
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <QrCode className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        QR Scans Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        28
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        156
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center">
              <QrCode className="h-5 w-5 mr-2" />
              Scan QR Code
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 mr-2" />
              Check Out Key
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 mr-2" />
              Check In Key
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Key Transactions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest key check-in and check-out activities.
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Lab Room 101 Key - Checked Out</p>
                      <p className="text-sm text-gray-500">Dr. Smith (Faculty) - Computer Science</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    10 minutes ago
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-2 w-2 bg-red-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Conference Room Key - Checked In</p>
                      <p className="text-sm text-gray-500">Prof. Johnson (HOD) - Electronics</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    1 hour ago
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Library Key - Checked Out</p>
                      <p className="text-sm text-gray-500">Ms. Davis (Faculty) - Mathematics</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    2 hours ago
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
