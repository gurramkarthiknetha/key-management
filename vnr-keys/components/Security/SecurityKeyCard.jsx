import { User, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Card, Badge } from '../ui';
import { getKeyStatusColor, formatDate, isKeyOverdue, getOverdueDays } from '../../lib/utils';

const SecurityKeyCard = ({ 
  keyData, 
  onClick,
  className = ""
}) => {
  const statusColor = getKeyStatusColor(keyData.status);
  const overdue = isKeyOverdue(keyData);
  const overdueDays = overdue ? getOverdueDays(keyData.dueDate) : 0;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={() => onClick(keyData)}
      variant={overdue ? 'danger' : 'default'}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {keyData.keyId}
            </h3>
            <Badge variant={statusColor} size="sm">
              {keyData.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-1">
            {keyData.labName}
          </p>
          <p className="text-xs text-gray-500">
            {keyData.keyName}
          </p>
        </div>
        {overdue && (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
      </div>

      {/* Key Details */}
      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="h-3 w-3 mr-1" />
          {keyData.location}
        </div>
        
        {keyData.facultyName && (
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-1" />
            {keyData.facultyName}
          </div>
        )}
        
        {keyData.dueDate && (
          <div className={`flex items-center text-xs ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="h-3 w-3 mr-1" />
            Due: {formatDate(keyData.dueDate)}
            {overdue && (
              <span className="ml-1 font-medium">
                ({overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {keyData.status === 'available' ? 'Available' : 'In Use'}
          </span>
          <div className={`w-2 h-2 rounded-full ${
            keyData.status === 'available' ? 'bg-green-500' : 
            overdue ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
        </div>
      </div>
    </Card>
  );
};

export default SecurityKeyCard;
