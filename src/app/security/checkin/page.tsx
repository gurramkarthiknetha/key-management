'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { KeyTransactionScanner } from '@/components/qr';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Key, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckinPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);

  // Check if user has permission
  if (user?.role !== UserRole.SECURITY_STAFF && user?.role !== UserRole.SECURITY_INCHARGE) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Key className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCheckinSuccess = (result: any) => {
    toast.success('Key checked in successfully!');
    setShowScanner(false);
    // Optionally redirect or refresh data
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Key Check-in</h1>
              <p className="mt-1 text-sm text-gray-600">
                Process key returns using QR code scanning
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          </div>
        </div>

        {!showScanner ? (
          /* Instructions and Start Button */
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Check-in a Key
              </h2>
              
              <div className="max-w-md mx-auto text-left space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-green-600">1</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Scan Key QR Code</h3>
                    <p className="text-sm text-gray-600">Point camera at the key's QR code to identify it</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-green-600">2</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Inspect Key Condition</h3>
                    <p className="text-sm text-gray-600">Check the physical condition of the returned key</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-medium text-green-600">3</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Complete Return</h3>
                    <p className="text-sm text-gray-600">Confirm the return and update key status</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowScanner(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Start QR Scanner
              </button>
            </div>
          </div>
        ) : (
          /* QR Scanner Component */
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">QR Code Scanner</h2>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close scanner</span>
                ×
              </button>
            </div>
            
            <KeyTransactionScanner
              mode="checkin"
              onSuccess={handleCheckinSuccess}
              className="max-w-lg mx-auto"
            />
          </div>
        )}

        {/* Tips and Guidelines */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-4">Return Guidelines</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3"></span>
              Carefully inspect the key for any damage or wear before accepting the return
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3"></span>
              Verify that the correct key is being returned by checking the QR code
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3"></span>
              Note any damage or issues in the return condition field
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3"></span>
              Record the exact location where the return is being processed
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3"></span>
              If the key is overdue, the system will automatically calculate late fees
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
