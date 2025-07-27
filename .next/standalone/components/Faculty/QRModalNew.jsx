'use client';

import { useState, useEffect } from 'react';
import { QrCode, Clock, MapPin, Key, AlertTriangle, Copy, Download, Share2 } from 'lucide-react';
import { Modal, Button, Card, Badge } from '../ui';
import QRCode from 'qrcode';

const QRModal = ({
  isOpen,
  onClose,
  keyData,
  mode = 'collection' // collection, deposit
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isOpen && keyData) {
      generateQRCode();
      startTimer();
    }
  }, [isOpen, keyData]);

  const generateQRCode = async () => {
    try {
      const qrData = {
        keyId: keyData.id,
        facultyId: keyData.facultyId || 'faculty-001',
        action: mode,
        timestamp: Date.now(),
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
      };

      const qrString = JSON.stringify(qrData);
      const url = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const startTimer = () => {
    setTimeRemaining(600);
    setIsExpired(false);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRefreshQR = () => {
    generateQRCode();
    startTimer();
  };

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      // Show toast notification
    } catch (error) {
      console.error('Failed to copy QR code:', error);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `qr-${keyData?.keyName}-${mode}-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${keyData?.keyName}`,
          text: `QR code for ${mode} of ${keyData?.keyName}`,
          url: qrCodeUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!keyData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'collection' ? 'Collect' : 'Deposit'} Key`}
      size="md"
    >
      <div className="space-y-6">
        {/* Key Information */}
        <Card role="faculty" padding="sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-faculty rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">{keyData.keyName}</h3>
              <div className="space-y-1 text-sm text-secondary">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{keyData.labName} ({keyData.labNumber})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={keyData.accessType === 'permanent' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {keyData.accessType}
                  </Badge>
                  {keyData.isOverdue && (
                    <Badge variant="danger" size="sm">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* QR Code Display */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-card">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto"
              />
            ) : (
              <div className="w-64 h-64 bg-surface-secondary rounded-lg flex items-center justify-center">
                <QrCode className="h-12 w-12 text-muted" />
              </div>
            )}
          </div>
        </div>

        {/* Timer and Status */}
        <div className="text-center">
          {isExpired ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">QR Code Expired</span>
              </div>
              <Button
                variant="primary"
                onClick={handleRefreshQR}
                className="w-full"
              >
                Generate New QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm text-secondary">
                  Expires in: <span className="font-mono font-medium text-warning">
                    {formatTime(timeRemaining)}
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted">
                Show this QR code to security for {mode}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isExpired && (
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyQR}
              icon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadQR}
              icon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareQR}
              icon={<Share2 className="h-4 w-4" />}
            >
              Share
            </Button>
          </div>
        )}

        {/* Instructions */}
        <Card variant="info" padding="sm">
          <div className="text-sm space-y-2">
            <h4 className="font-medium text-primary">Instructions:</h4>
            <ul className="space-y-1 text-secondary">
              <li>• Present this QR code to security personnel</li>
              <li>• QR code is valid for 10 minutes only</li>
              <li>• {mode === 'collection' ? 'Collect your key after verification' : 'Hand over the key after scanning'}</li>
              <li>• Keep your phone screen bright for easy scanning</li>
            </ul>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default QRModal;
