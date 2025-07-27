'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Camera, AlertCircle } from 'lucide-react';
import { Button, Card } from './';

// Dynamically import QRScanner to avoid SSR issues
const QRScannerComponent = dynamic(() => import('./QRScanner'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Scanner...
            </h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing camera scanner...</p>
        </div>
      </Card>
    </div>
  )
});

const QRScannerWrapper = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return null;
  }

  return <QRScannerComponent {...props} />;
};

export default QRScannerWrapper;
