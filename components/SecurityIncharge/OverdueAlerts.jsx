import { AlertTriangle, Clock, User, Send } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { formatDate, getOverdueDays } from '../../lib/utils';

const OverdueAlerts = ({ 
  overdueKeys = [], 
  onNotifyFaculty,
  onRevokeAccess,
  className = ""
}) => {
  return (
    <Card className={className} padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Overdue Alerts
          </h3>
          <Badge variant="danger" size="sm">
            {overdueKeys.length}
          </Badge>
        </div>
      </div>

      {overdueKeys.length > 0 ? (
        <div className="space-y-4">
          {overdueKeys.map((key) => {
            const overdueDays = getOverdueDays(key.dueDate);
            return (
              <div
                key={key.id}
                className="p-4 border border-red-200 bg-red-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {key.keyId}
                      </h4>
                      <Badge variant="danger" size="sm">
                        {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1">
                      {key.labName} - {key.keyName}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{key.facultyName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Due: {formatDate(key.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNotifyFaculty(key)}
                      icon={<Send className="h-3 w-3" />}
                    >
                      Notify
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRevokeAccess(key)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Overdue Keys
          </h4>
          <p className="text-gray-600">
            All keys are returned on time or within the grace period.
          </p>
        </div>
      )}
    </Card>
  );
};

export default OverdueAlerts;
