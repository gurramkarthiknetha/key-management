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

  const initializeScanner = () => {
    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Handle scan errors silently for better UX
          console.log('Scan error:', errorMessage);
        }
      );

      setScanner(html5QrcodeScanner);
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize scanner:', err);
      setError('Failed to initialize camera. Please check permissions.');
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
              <Button
                variant="primary"
                onClick={() => {
                  setError(null);
                  initializeScanner();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full"></div>
              {isScanning && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Position the QR code within the frame to scan
                  </p>
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
