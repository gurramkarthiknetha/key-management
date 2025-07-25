'use client';

import { useState } from 'react';
import { Button, Card } from './ui';

const QRGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [qrData, setQrData] = useState('');

  const testKeys = [
    {
      keyId: 'LAB-CS-001',
      keyName: 'Computer Science Lab 1 Main Key',
      department: 'Computer Science'
    },
    {
      keyId: 'LAB-PH-001',
      keyName: 'Physics Laboratory Key',
      department: 'Physics'
    },
    {
      keyId: 'LAB-CH-001',
      keyName: 'Chemistry Lab Key',
      department: 'Chemistry'
    }
  ];

  const generateQRCode = (keyData) => {
    try {
      const qrDataString = JSON.stringify({
        keyId: keyData.keyId,
        keyName: keyData.keyName,
        department: keyData.department,
        timestamp: new Date().toISOString()
      });

      // Use QR Server API for generating QR codes
      const encodedData = encodeURIComponent(qrDataString);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;

      setQrCodeUrl(url);
      setSelectedKey(keyData.keyId);
      setQrData(qrDataString);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${selectedKey}-qr-code.png`;
      link.href = qrCodeUrl;
      link.target = '_blank';
      link.click();
    }
  };

  const copyQRData = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData);
      alert('QR data copied to clipboard!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          QR Code Generator
        </h2>
        <p className="text-gray-600 mb-6">
          Generate QR codes for testing the scanner functionality
        </p>

        <div className="space-y-4">
          {testKeys.map((key) => (
            <Button
              key={key.keyId}
              variant="outline"
              onClick={() => generateQRCode(key)}
              className="w-full text-left justify-start"
            >
              <div>
                <div className="font-medium">{key.keyId}</div>
                <div className="text-sm text-gray-500">{key.keyName}</div>
              </div>
            </Button>
          ))}
        </div>

        {qrCodeUrl && (
          <div className="mt-6 text-center">
            <div className="mb-4">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${selectedKey}`}
                className="mx-auto border rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              QR Code for {selectedKey}
            </p>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={downloadQRCode}
                className="w-full"
              >
                Download QR Code
              </Button>
              <Button
                variant="outline"
                onClick={copyQRData}
                className="w-full"
              >
                Copy QR Data
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h3 className="text-sm font-medium text-primary-900 mb-2">
            How to test:
          </h3>
          <ol className="text-xs text-primary-800 space-y-1">
            <li>1. Generate a QR code above</li>
            <li>2. Login as FAC001 or FAC002</li>
            <li>3. Go to Scanner tab</li>
            <li>4. Scan the QR code with your camera</li>
            <li>5. Check the access result</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default QRGenerator;
