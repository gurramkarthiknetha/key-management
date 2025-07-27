'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Camera, Scan } from 'lucide-react';
import { Header, QRScanner, Button, Card, useToast } from '../ui';
import { useQRScanner, useAuth } from '../../lib/useAuth';

const QRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();
  const { loading, error, scanResult, clearError, clearResult, scanQRCode } = useQRScanner();
  const { success, error: showError } = useToast();

  useEffect(() => {
    // Get device info for logging - only on client side
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      setDeviceInfo(`${platform} - ${userAgent.substring(0, 100)}`);
    }
  }, []);

  const handleStartScan = () => {
    clearError();
    clearResult();
    setScanSuccess(null);
    setIsScanning(true);
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    setIsScanning(false);

    // Get current location (you could enhance this with geolocation)
    const location = typeof window !== 'undefined' ? window.location.href : 'Faculty Mobile Device';

    try {
      const result = await scanQRCode(decodedText, location, deviceInfo);

      if (result.success) {
        setScanSuccess({
          type: 'success',
          message: 'Access granted successfully!',
          data: result.data
        });
        success('QR code scanned successfully - access granted!');
      } else {
        setScanSuccess({
          type: 'error',
          message: result.error || 'Access denied',
          data: null
        });
        showError(result.error || 'Access denied');
      }
    } catch (err) {
      setScanSuccess({
        type: 'error',
        message: 'Failed to process QR code',
        data: null
      });
      showError('Failed to process QR code');
    }
  };

  const handleScanError = (error) => {
    console.log('QR Scan error:', error);
    // Don't show errors for scanning attempts, only for camera issues
  };

  const handleBack = () => {
    router.push('/faculty');
  };

  const handleTryAgain = () => {
    setScanSuccess(null);
    clearError();
    clearResult();
    handleStartScan();
  };

  const ResultCard = ({ result }) => {
    const isSuccess = result.type === 'success';
    const Icon = isSuccess ? CheckCircle : XCircle;
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

    return (
      <Card className={`p-6 ${bgColor} ${borderColor} border`}>
        <div className="text-center">
          <Icon className={`h-16 w-16 mx-auto mb-4 ${iconColor}`} />
          <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
            {isSuccess ? 'Access Granted' : 'Access Denied'}
          </h3>
          <p className={`mb-4 ${textColor}`}>
            {result.message}
          </p>
          
          {isSuccess && result.data && (
            <div className="bg-white rounded-lg p-4 mb-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Key Information:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Key ID:</span> {result.data.key?.keyId}</p>
                <p><span className="font-medium">Key Name:</span> {result.data.key?.keyName}</p>
                <p><span className="font-medium">Lab:</span> {result.data.key?.labName}</p>
                <p><span className="font-medium">Department:</span> {result.data.key?.department}</p>
                <p><span className="font-medium">Location:</span> {result.data.key?.location}</p>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleTryAgain}
              className="flex-1"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan Again
            </Button>
            <Button
              variant="primary"
              onClick={handleBack}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="QR Scanner"
        showBack={true}
        onBackClick={handleBack}
        showProfile={true}
        onProfileClick={() => router.push('/faculty/profile')}
      />

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Scan QR Code
          </h2>
          <p className="text-gray-600">
            Position the QR code within the camera frame to scan
          </p>
        </div>

        {/* Scanner Section */}
        <div className="mb-6">
          {!isScanning && !scanSuccess && (
            <Card className="p-8 text-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-600 mb-6">
                Tap the button below to start scanning QR codes
              </p>
              <Button
                variant="primary"
                onClick={handleStartScan}
                className="w-full"
                disabled={loading}
              >
                <Scan className="h-5 w-5 mr-2" />
                Start Scanning
              </Button>
            </Card>
          )}

          <QRScanner
            isActive={isScanning}
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={handleStopScan}
          />

          {scanSuccess && (
            <ResultCard result={scanSuccess} />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Scanning Error</h4>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Scanning Instructions
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 font-medium text-xs">1</span>
              </div>
              <p>Ensure good lighting and hold your device steady</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 font-medium text-xs">2</span>
              </div>
              <p>Position the QR code within the scanning frame</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 font-medium text-xs">3</span>
              </div>
              <p>Wait for the automatic scan - no need to tap</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 font-medium text-xs">4</span>
              </div>
              <p>You can only access keys that are assigned to you</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default QRScannerPage;
