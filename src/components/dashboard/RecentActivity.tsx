import React from 'react';
import { LogAction } from '@/types';
import { Key, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Activity {
  _id: string;
  action: LogAction;
  timestamp: string;
  key: {
    name: string;
    keyId: string;
  };
  user: {
    name: string;
    employeeId: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActionIcon = (action: LogAction) => {
    switch (action) {
      case LogAction.CHECKOUT:
        return <Key className="h-5 w-5 text-blue-500" />;
      case LogAction.CHECKIN:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case LogAction.OVERDUE:
        return <Clock className="h-5 w-5 text-red-500" />;
      case LogAction.LOST:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Key className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionText = (action: LogAction) => {
    switch (action) {
      case LogAction.CHECKOUT:
        return 'checked out';
      case LogAction.CHECKIN:
        return 'checked in';
      case LogAction.OVERDUE:
        return 'marked overdue';
      case LogAction.LOST:
        return 'reported lost';
      default:
        return action.toLowerCase();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <li key={activity._id} className="py-4 px-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}{getActionText(activity.action)}{' '}
                  <span className="font-medium">{activity.key.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {activity.key.keyId} • {activity.user.employeeId}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm text-gray-500">
                {formatTime(activity.timestamp)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
