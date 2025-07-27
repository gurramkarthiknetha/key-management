"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Button, Card } from './';
import QrScanner from 'qr-scanner';

const QRScanner = ({
  onScanSuccess,
  onScanError,
  isActive = false,
  onClose,
  className = ""
}) => {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    if (isActive && !scanner && isClient) {
      initializeScanner();
    } else if (!isActive && scanner) {
      cleanupScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [isActive, isClient]);

  const initializeScanner = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        setError('Scanner not available on server side.');
        return;
      }

      console.log('🎥 Initializing QR Scanner...');

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device.');
        return;
      }

      // Get video element with a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      const videoElement = document.getElementById('qr-reader');
      if (!videoElement) {
        setError('Video element not found');
        return;
      }

      console.log('📹 Video element found, requesting camera access...');

      // Test camera access first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment' // Prefer back camera
          }
        });
        console.log('✅ Camera access granted');

        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error('❌ Camera permission denied:', permissionError);
        setError('Camera access denied. Please allow camera permissions and try again.');
        return;
      }

      // Initialize QR Scanner
      console.log('🔍 Creating QR Scanner instance...');
      const qrScanner = new QrScanner(
        videoElement,
        (result) => {
          console.log('✅ QR Code detected:', result.data);
          handleScanSuccess(result.data, result);
        },
        {
          onDecodeError: (error) => {
            // Don't log decode errors as they happen frequently during scanning
            // console.log('QR decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      // Start scanning
      console.log('▶️ Starting QR Scanner...');
      await qrScanner.start();
      console.log('🎯 QR Scanner started successfully');

      setScanner(qrScanner);
      setIsScanning(true);
      setError(null);

    } catch (err) {
      console.error('❌ Failed to initialize scanner:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported on this device.');
      } else {
        setError(`Failed to initialize camera: ${err.message}`);
      }
    }
  };

  const cleanupScanner = () => {
    if (scanner) {
      try {
        // Stop QR Scanner
        scanner.stop();
        scanner.destroy();
      } catch (err) {
        console.error('Error cleaning up scanner:', err);
      }
      setScanner(null);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    try {
      cleanupScanner();
      onScanSuccess?.(decodedText, decodedResult);
    } catch (err) {
      console.error('Error handling scan success:', err);
      setError('Failed to process QR code data.');
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onClose?.();
  };

  if (!isActive || !isClient) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Scan QR Code
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            icon={<X className="h-4 w-4" />}
          />
        </div>

        {/* Scanner Container */}
        <div className="mb-4">
          {error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setError(null);
                    initializeScanner();
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
                {error.includes('permission') && (
                  <div className="text-xs text-gray-600 mt-2">
                    <p>To enable camera access:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Click the camera icon in your browser's address bar</li>
                      <li>Select "Allow" for camera permissions</li>
                      <li>Refresh the page and try again</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <video id="qr-reader" className="w-full max-w-md mx-auto rounded-lg"></video>
              {isScanning && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Position the QR code within the frame to scan
                  </p>
                  <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Good lighting helps
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-1"></div>
                      Hold steady
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-primary-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Hold your device steady</li>
            <li>• Ensure good lighting</li>
            <li>• Position QR code within the frame</li>
            <li>• Wait for automatic detection</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QRScanner;
