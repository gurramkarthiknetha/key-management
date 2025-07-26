import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Modal, Button, QRCodeDisplay } from '../ui';
import { generateKeyQRData } from '../../lib/utils';

const QRModal = ({ 
  isOpen, 
  onClose, 
  keyData 
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!keyData) return null;

  const qrData = generateKeyQRData(keyData);

  const handleCopyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy QR data:', error);
    }
  };

  const handleDownloadQR = () => {
    // Create a temporary canvas to get the QR code as image
    const canvas = document.querySelector('#qr-modal canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${keyData.keyId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code"
      size="sm"
    >
      <div className="text-center">
        {/* Key Info */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">
            {keyData.labName}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {keyData.keyName}
          </p>
          <p className="text-xs text-gray-500">
            Key ID: {keyData.keyId}
          </p>
        </div>

        {/* QR Code */}
        <div id="qr-modal" className="flex justify-center mb-6">
          <QRCodeDisplay 
            value={qrData}
            size={200}
            className="border border-gray-200 rounded-lg p-4"
          />
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-800">
            Show this QR code to security personnel for key access verification.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleCopyQRData}
            icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            className="flex-1"
          >
            {copied ? 'Copied!' : 'Copy Data'}
          </Button>
          <Button
            variant="primary"
            onClick={handleDownloadQR}
            icon={<Download className="h-4 w-4" />}
            className="flex-1"
          >
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRModal;
