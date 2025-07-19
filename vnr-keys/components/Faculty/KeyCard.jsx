import { QrCode, Share2, Clock, MapPin } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { getKeyStatusColor, formatDate, isKeyOverdue } from '../../lib/utils';

const KeyCard = ({ 
  keyData, 
  onViewQR, 
  onShare,
  className = ""
}) => {
  const statusColor = getKeyStatusColor(keyData.status);
  const overdue = isKeyOverdue(keyData);

  return (
    <Card 
      className={`min-w-[280px] max-w-[280px] ${className}`}
      variant={overdue ? 'danger' : 'default'}
      hover
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {keyData.labName}
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            {keyData.keyName}
          </p>
          <Badge variant={statusColor} size="sm">
            {keyData.status === 'permanent' ? 'Permanent' : 'Temporary'}
          </Badge>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewQR(keyData)}
            icon={<QrCode className="h-4 w-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(keyData)}
            icon={<Share2 className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Key Details */}
      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="h-3 w-3 mr-1" />
          {keyData.location}
        </div>
        
        {keyData.dueDate && (
          <div className={`flex items-center text-xs ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="h-3 w-3 mr-1" />
            Due: {formatDate(keyData.dueDate)}
            {overdue && <span className="ml-1 font-medium">(Overdue)</span>}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Key ID: {keyData.keyId}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Assigned: {formatDate(keyData.assignedDate)}
        </div>
      </div>
    </Card>
  );
};

export default KeyCard;
