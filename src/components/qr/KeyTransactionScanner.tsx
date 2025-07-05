'use client';

import React, { useState } from 'react';
import QRCodeScanner, { ManualQRInput } from './QRCodeScanner';
import { parseQRCode, QRData } from '@/utils/qr';
import { useOfflineTransaction } from '@/hooks/useOfflineTransaction';
import { ApiResponse } from '@/types';
import { CheckCircle, XCircle, Key, User, Clock, MapPin, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface KeyTransactionScannerProps {
  mode: 'checkout' | 'checkin';
  onSuccess?: (result: any) => void;
  className?: string;
}

export default function KeyTransactionScanner({
  mode,
  onSuccess,
  className = ''
}: KeyTransactionScannerProps) {
  const [step, setStep] = useState<'key' | 'user' | 'confirm' | 'processing'>('key');
  const [keyQR, setKeyQR] = useState<string | null>(null);
  const [userQR, setUserQR] = useState<string | null>(null);
  const [location, setLocation] = useState('Security Desk');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(24);
  const [returnCondition, setReturnCondition] = useState<'good' | 'damaged' | 'lost'>('good');
  const [useManualInput, setUseManualInput] = useState(false);

  const { submitTransaction, isSubmitting, isOffline } = useOfflineTransaction();

  const handleKeyQRScan = (data: QRData) => {
    if (data.type !== 'key') {
      toast.error('Please scan a key QR code');
      return;
    }
    
    setKeyQR(JSON.stringify(data));
    
    if (mode === 'checkout') {
      setStep('user');
    } else {
      setStep('confirm');
    }
    
    toast.success('Key QR code scanned successfully');
  };

  const handleUserQRScan = (data: QRData) => {
    if (data.type !== 'user') {
      toast.error('Please scan a user QR code');
      return;
    }
    
    setUserQR(JSON.stringify(data));
    setStep('confirm');
    toast.success('User QR code scanned successfully');
  };

  const handleManualQRInput = (qrString: string) => {
    const data = parseQRCode(qrString);
    
    if (!data) {
      toast.error('Invalid QR code format');
      return;
    }

    if (step === 'key') {
      handleKeyQRScan(data);
    } else if (step === 'user') {
      handleUserQRScan(data);
    }
  };

  const processTransaction = async () => {
    if (!keyQR || (mode === 'checkout' && !userQR)) {
      toast.error('Missing required QR codes');
      return;
    }

    setStep('processing');

    try {
      const keyData = JSON.parse(keyQR);
      const userData = userQR ? JSON.parse(userQR) : null;

      const transactionData = {
        keyId: keyData.id,
        userId: userData?.id,
        location,
        notes,
        duration: mode === 'checkout' ? duration : undefined,
        condition: mode === 'checkin' ? returnCondition : undefined
      };

      const success = await submitTransaction(
        mode === 'checkout' ? 'check_out' : 'check_in',
        transactionData
      );

      if (success) {
        onSuccess?.(transactionData);
        resetScanner();
      } else {
        setStep('confirm');
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      toast.error(`Failed to ${mode} key`);
      setStep('confirm');
    }
  };

  const resetScanner = () => {
    setStep('key');
    setKeyQR(null);
    setUserQR(null);
    setLocation('Security Desk');
    setNotes('');
    setDuration(24);
    setReturnCondition('good');
    setUseManualInput(false);
  };

  const renderStepIndicator = () => {
    const steps = mode === 'checkout' ? ['key', 'user', 'confirm'] : ['key', 'confirm'];
    const currentIndex = steps.indexOf(step);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              index <= currentIndex 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-center mb-4">
          Key {mode === 'checkout' ? 'Check-out' : 'Check-in'}
        </h2>

        {renderStepIndicator()}

        {step === 'key' && (
          <div className="space-y-4">
            <div className="text-center">
              <Key className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <h3 className="text-lg font-medium">Scan Key QR Code</h3>
              <p className="text-gray-600">Point camera at the key's QR code</p>
            </div>

            {!useManualInput ? (
              <QRCodeScanner
                onScan={handleKeyQRScan}
                expectedType="key"
                onError={(error) => toast.error(error)}
              />
            ) : (
              <ManualQRInput
                onSubmit={handleManualQRInput}
                placeholder="Enter key QR code data"
              />
            )}

            <button
              onClick={() => setUseManualInput(!useManualInput)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {useManualInput ? 'Use Camera Scanner' : 'Enter Manually'}
            </button>
          </div>
        )}

        {step === 'user' && mode === 'checkout' && (
          <div className="space-y-4">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-medium">Scan User QR Code</h3>
              <p className="text-gray-600">Point camera at the user's ID card QR code</p>
            </div>

            {!useManualInput ? (
              <QRCodeScanner
                onScan={handleUserQRScan}
                expectedType="user"
                onError={(error) => toast.error(error)}
              />
            ) : (
              <ManualQRInput
                onSubmit={handleManualQRInput}
                placeholder="Enter user QR code data"
              />
            )}

            <button
              onClick={() => setUseManualInput(!useManualInput)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {useManualInput ? 'Use Camera Scanner' : 'Enter Manually'}
            </button>

            <button
              onClick={() => setStep('key')}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Key Scan
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-medium">Confirm {mode === 'checkout' ? 'Check-out' : 'Check-in'}</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {mode === 'checkout' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {mode === 'checkin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Condition
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as 'good' | 'damaged' | 'lost')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="good">Good Condition</option>
                    <option value="damaged">Damaged</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(mode === 'checkout' ? 'user' : 'key')}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={processTransaction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm {mode === 'checkout' ? 'Check-out' : 'Check-in'}
              </button>
            </div>
          </div>
        )}

        {(step === 'processing' || isSubmitting) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Processing {mode}...
              {isOffline && (
                <span className="block text-sm text-yellow-600 mt-2">
                  <WifiOff className="inline h-4 w-4 mr-1" />
                  Offline mode - will sync when connected
                </span>
              )}
            </p>
          </div>
        )}

        {(step === 'key' || step === 'user') && (
          <button
            onClick={resetScanner}
            className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
