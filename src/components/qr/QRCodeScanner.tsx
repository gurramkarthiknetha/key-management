'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerConfig, Html5QrcodeResult } from 'html5-qrcode';
import { parseQRCode, QRData } from '@/utils/qr';
import { Camera, X, RefreshCw } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (data: QRData) => void;
  onError?: (error: string) => void;
  expectedType?: 'key' | 'user';
  className?: string;
}

export default function QRCodeScanner({
  onScan,
  onError,
  expectedType,
  className = ''
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const config: Html5QrcodeScannerConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false,
    supportedScanTypes: [],
  };

  const startScanning = () => {
    if (!elementRef.current) return;

    setIsScanning(true);
    setError(null);

    const scanner = new Html5QrcodeScanner('qr-scanner', config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText: string, result: Html5QrcodeResult) => {
        // Parse the QR code
        const qrData = parseQRCode(decodedText);
        
        if (!qrData) {
          const errorMsg = 'Invalid QR code format';
          setError(errorMsg);
          onError?.(errorMsg);
          return;
        }

        // Check if it matches expected type
        if (expectedType && qrData.type !== expectedType) {
          const errorMsg = `Expected ${expectedType} QR code, but got ${qrData.type}`;
          setError(errorMsg);
          onError?.(errorMsg);
          return;
        }

        // Success - call the onScan callback
        onScan(qrData);
        stopScanning();
      },
      (errorMessage: string) => {
        // Handle scan errors (usually just no QR code found)
        console.log('QR scan error:', errorMessage);
      }
    );
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={`qr-scanner-container ${className}`}>
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={startScanning}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start QR Scanner
          </button>
          {expectedType && (
            <p className="mt-2 text-sm text-gray-600">
              Scan a {expectedType} QR code
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Scanning QR Code...</h3>
            <button
              onClick={stopScanning}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div id="qr-scanner" ref={elementRef} className="w-full" />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Clear error
              </button>
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={() => {
                stopScanning();
                setTimeout(startScanning, 100);
              }}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Restart Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Manual QR input component as fallback
interface ManualQRInputProps {
  onSubmit: (qrString: string) => void;
  placeholder?: string;
  className?: string;
}

export function ManualQRInput({
  onSubmit,
  placeholder = 'Enter QR code data manually',
  className = ''
}: ManualQRInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div>
        <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 mb-1">
          Manual QR Code Input
        </label>
        <input
          id="qr-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={!input.trim()}
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Process QR Code
      </button>
    </form>
  );
}
