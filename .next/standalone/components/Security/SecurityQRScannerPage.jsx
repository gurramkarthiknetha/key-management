'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Camera, Scan, Shield } from 'lucide-react';
import { Header, QRScanner, Button, Card, useToast } from '../ui';
import { useQRScanner, useAuth } from '../../lib/useAuth';

const SecurityQRScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();
  const { loading, clearError, clearResult, scanQRCode } = useQRScanner();
  const { success, error: showError } = useToast();

  useEffect(() => {
    // Get device info for logging - only on client side
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent;
      const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown';
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

  const handleScanSuccess = async (decodedText) => {
    console.log('QR Code scanned:', decodedText);
    setIsScanning(false);

    // Get current location for logging
    const location = typeof window !== 'undefined' ? window.location.href : 'Security Scanner';

    try {
      const result = await scanQRCode(decodedText, location, deviceInfo);

      if (result.success) {
        setScanSuccess({
          type: 'success',
          message: 'Key verification successful!',
          data: result.data
        });
        success('QR code scanned successfully - key verified!');
      } else {
        setScanSuccess({
          type: 'error',
          message: result.error || 'Key verification failed',
          data: null
        });
        showError(result.error || 'Key verification failed');
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
    // Navigate back based on user role
    if (user?.role === 'security_incharge') {
      router.push('/securityincharge');
    } else {
      router.push('/security');
    }
  };

  const handleScanAnother = () => {
    setScanSuccess(null);
    setIsScanning(false);
  };

  // Result Card Component
  const ResultCard = ({ result }) => {
    const isSuccess = result.type === 'success';
    const IconComponent = isSuccess ? CheckCircle : XCircle;
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

    return (
      <Card className={`${bgColor} border-0`}>
        <div className="p-6 text-center">
          <IconComponent className={`h-16 w-16 ${iconColor} mx-auto mb-4`} />
          <h3 className={`text-lg font-medium ${textColor} mb-2`}>
            {isSuccess ? 'Verification Successful' : 'Verification Failed'}
          </h3>
          <p className={`${textColor} mb-4`}>
            {result.message}
          </p>
          
          {isSuccess && result.data?.key && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Key Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Key ID:</span> {result.data.key.keyId}</p>
                <p><span className="font-medium">Key Name:</span> {result.data.key.keyName}</p>
                <p><span className="font-medium">Lab:</span> {result.data.key.labName}</p>
                <p><span className="font-medium">Department:</span> {result.data.key.department}</p>
                <p><span className="font-medium">Location:</span> {result.data.key.location}</p>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleScanAnother}
            className="w-full"
          >
            Scan Another Key
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Security QR Scanner"
        showBack={true}
        onBackClick={handleBack}
        showProfile={true}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Security Badge */}
        <div className="mb-6">
          <Card className="bg-primary-50 border-primary-200">
            <div className="p-4 flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-medium text-primary-900">Security Verification</h3>
                <p className="text-sm text-primary-700">Scan QR codes to verify key access</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scanner Section */}
        <div className="mb-6">
          {!isScanning && !scanSuccess && (
            <Card className="p-8 text-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Verify
              </h3>
              <p className="text-gray-600 mb-6">
                Tap the button below to start scanning QR codes for key verification
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

        {/* Instructions for Security */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Security Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 font-medium text-xs">1</span>
                </div>
                <p>Verify faculty identity before allowing key access</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 font-medium text-xs">2</span>
                </div>
                <p>Scan the QR code to verify key assignment</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 font-medium text-xs">3</span>
                </div>
                <p>Check that the key details match the request</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary-600 font-medium text-xs">4</span>
                </div>
                <p>Only release keys to authorized faculty members</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SecurityQRScannerPage;
