import React from 'react';
import { Clock, User, AlertTriangle } from 'lucide-react';

interface SoonDueKey {
  _id: string;
  name: string;
  keyId: string;
  dueDate: string;
  currentHolder: {
    name: string;
    employeeId: string;
  };
}

interface SoonDueKeysProps {
  keys: SoonDueKey[];
}

export default function SoonDueKeys({ keys }: SoonDueKeysProps) {
  const formatTimeUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInMinutes = Math.floor((due.getTime() - now.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) return 'Overdue';
    if (diffInMinutes < 60) return `${diffInMinutes}m left`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h left`;
    return `${Math.floor(diffInMinutes / 1440)}d left`;
  };

  const getUrgencyColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 0) return 'text-red-600 bg-red-50';
    if (diffInHours < 2) return 'text-red-500 bg-red-50';
    if (diffInHours < 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (keys.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No keys due soon</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="divide-y divide-gray-200">
        {keys.map((key) => (
          <li key={key._id} className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${getUrgencyColor(key.dueDate)}`}>
                    {new Date(key.dueDate) < new Date() ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500">
                    ID: {key.keyId}
                  </p>
                  <div className="flex items-center mt-1">
                    <User className="h-3 w-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">
                      {key.currentHolder.name} ({key.currentHolder.employeeId})
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(key.dueDate)}`}>
                  {formatTimeUntilDue(key.dueDate)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
