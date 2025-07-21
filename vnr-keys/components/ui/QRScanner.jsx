"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
      // Check for camera permissions first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (permissionError) {
          console.error('Camera permission denied:', permissionError);
          setError('Camera access denied. Please allow camera permissions and try again.');
          return;
        }
      } else {
        setError('Camera not supported on this device.');
        return;
      }

      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Handle scan errors silently for better UX
          // Only log actual scanning errors, not camera initialization
          if (!errorMessage.includes('NotFoundException')) {
            console.log('Scan error:', errorMessage);
          }
        }
      );

      setScanner(html5QrcodeScanner);
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize scanner:', err);
      setError('Failed to initialize camera. Please check permissions and try again.');
    }
  };

  const cleanupScanner = () => {
    if (scanner) {
      try {
        scanner.clear();
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

  if (!isActive) {
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
              <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
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
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      Hold steady
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
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
