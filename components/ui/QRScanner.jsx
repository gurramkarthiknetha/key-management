"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Button, Card } from './';

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
    if (isActive && !scanner) {
      initializeScanner();
    } else if (!isActive && scanner) {
      cleanupScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [isActive]);

  const initializeScanner = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        setError('Scanner not available on server side.');
        return;
      }

      // Check for camera permissions first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Get video element
          const videoElement = document.getElementById('qr-reader');
          if (!videoElement) {
            setError('Video element not found');
            return;
          }

          // Set video stream
          videoElement.srcObject = stream;

          // For now, just show the camera feed
          // TODO: Implement QR code detection
          setScanner({ stream });
          setIsScanning(true);
          setError(null);

          // Simulate QR code detection after 5 seconds for testing
          setTimeout(() => {
            handleScanSuccess('test-qr-code-data', { text: 'test-qr-code-data' });
          }, 5000);

        } catch (permissionError) {
          console.error('Camera permission denied:', permissionError);
          setError('Camera access denied. Please allow camera permissions and try again.');
          return;
        }
      } else {
        setError('Camera not supported on this device.');
        return;
      }
    } catch (err) {
      console.error('Failed to initialize scanner:', err);
      setError('Failed to initialize camera. Please check permissions and try again.');
    }
  };

  const cleanupScanner = () => {
    if (scanner && scanner.stream) {
      try {
        // Stop all video tracks
        scanner.stream.getTracks().forEach(track => track.stop());
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
              <video id="qr-reader" className="w-full max-w-md mx-auto rounded-lg" autoPlay playsInline></video>
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
