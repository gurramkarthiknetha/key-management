import { useState } from 'react';
import { User, Clock, MapPin, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Modal, Button, Badge, QRCodeDisplay } from '../ui';
import { getKeyStatusColor, formatDate, isKeyOverdue, generateKeyQRData } from '../../lib/utils';

const KeyDetailModal = ({ 
  isOpen, 
  onClose, 
  keyData,
  onHandover,
  onMarkDeposited 
}) => {
  const [loading, setLoading] = useState(false);
  
  if (!keyData) return null;

  const statusColor = getKeyStatusColor(keyData.status);
  const overdue = isKeyOverdue(keyData);
  const qrData = generateKeyQRData(keyData);

  const handleHandover = async () => {
    setLoading(true);
    try {
      await onHandover(keyData);
      onClose();
    } catch (error) {
      console.error('Handover failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDeposited = async () => {
    setLoading(true);
    try {
      await onMarkDeposited(keyData);
      onClose();
    } catch (error) {
      console.error('Mark deposited failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Key Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Key Info Header */}
        <div className={`p-4 rounded-lg ${overdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {keyData.keyId}
                </h3>
                <Badge variant={statusColor}>
                  {keyData.status}
                </Badge>
                {overdue && (
                  <Badge variant="danger" size="sm">
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-gray-700 font-medium">
                {keyData.labName}
              </p>
              <p className="text-gray-600 text-sm">
                {keyData.keyName}
              </p>
            </div>
            {overdue && (
              <AlertTriangle className="h-6 w-6 text-red-500" />
            )}
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-900">{keyData.location}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Key className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 text-gray-900">{keyData.department}</span>
                </div>

                {keyData.facultyName && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="ml-2 text-gray-900">{keyData.facultyName}</span>
                  </div>
                )}

                {keyData.assignedDate && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Assigned:</span>
                    <span className="ml-2 text-gray-900">{formatDate(keyData.assignedDate)}</span>
                  </div>
                )}

                {keyData.dueDate && (
                  <div className={`flex items-center text-sm ${overdue ? 'text-red-600' : ''}`}>
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Due:</span>
                    <span className="ml-2">{formatDate(keyData.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {keyData.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {keyData.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center">
            <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
            <QRCodeDisplay 
              value={qrData}
              size={150}
              className="border border-gray-200 rounded-lg p-3"
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              Scan for verification
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          
          {keyData.status !== 'available' && (
            <Button
              variant="success"
              onClick={handleMarkDeposited}
              loading={loading}
              icon={<CheckCircle className="h-4 w-4" />}
              className="flex-1"
            >
              Mark as Deposited
            </Button>
          )}
          
          {keyData.status === 'available' && (
            <Button
              variant="primary"
              onClick={handleHandover}
              loading={loading}
              icon={<User className="h-4 w-4" />}
              className="flex-1"
            >
              Handover Key
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KeyDetailModal;
