'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Mail, Send, Settings, AlertTriangle, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailConfig {
  configured: boolean;
  host: string;
  port: number;
  user: string;
  hasCredentials: boolean;
  connectionWorking: boolean;
  environmentVariables: Record<string, boolean>;
}

interface OverdueKey {
  keyId: string;
  keyName: string;
  userName: string;
  userEmail: string;
  dueDate: string;
  daysOverdue: number;
  location: string;
}

export default function NotificationsPage() {
  const { user, authenticatedFetch } = useAuth();
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [overdueKeys, setOverdueKeys] = useState<OverdueKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Check if user has permission
  if (!user || !['Security Incharge', 'HOD'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">You don't have permission to access notifications.</span>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configResponse, overdueResponse] = await Promise.all([
        authenticatedFetch('/api/notifications/config'),
        authenticatedFetch('/api/notifications/overdue-alerts')
      ]);

      const configData = await configResponse.json();
      const overdueData = await overdueResponse.json();

      if (configData.success) {
        setEmailConfig(configData.data);
      }

      if (overdueData.success) {
        setOverdueKeys(overdueData.data.overdueKeys);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load notification data');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);
    try {
      const response = await authenticatedFetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_email',
          data: { email: testEmail }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Test email sent successfully');
        setTestEmail('');
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const sendDailyReport = async () => {
    setSending(true);
    try {
      const response = await authenticatedFetch('/api/notifications/daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Daily report sent successfully');
      } else {
        toast.error(result.error || 'Failed to send daily report');
      }
    } catch (error) {
      console.error('Daily report error:', error);
      toast.error('Failed to send daily report');
    } finally {
      setSending(false);
    }
  };

  const sendOverdueAlerts = async () => {
    setSending(true);
    try {
      const response = await authenticatedFetch('/api/notifications/overdue-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to send overdue alerts');
      }
    } catch (error) {
      console.error('Overdue alerts error:', error);
      toast.error('Failed to send overdue alerts');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Notification Management</span>
        </div>
      </div>

      {/* Email Configuration Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Email Configuration
          </h2>
          {emailConfig?.configured ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Configured</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Not Configured</span>
            </div>
          )}
        </div>

        {emailConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">SMTP Settings</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Host: {emailConfig.host}</p>
                <p>Port: {emailConfig.port}</p>
                <p>User: {emailConfig.user}</p>
                <p>Connection: {emailConfig.connectionWorking ? '✅ Working' : '❌ Failed'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(emailConfig.environmentVariables).map(([key, value]) => (
                  <p key={key} className={value ? 'text-green-600' : 'text-red-600'}>
                    {key}: {value ? '✅' : '❌'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Email */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium mb-3">Test Email</h3>
          <div className="flex space-x-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address to test"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendTestEmail}
              disabled={sending || !emailConfig?.configured}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Report
          </h2>
          <p className="text-gray-600 mb-4">
            Send today's activity summary to administrators.
          </p>
          <button
            onClick={sendDailyReport}
            disabled={sending || !emailConfig?.configured}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Daily Report'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Overdue Alerts
          </h2>
          <p className="text-gray-600 mb-2">
            Send alerts to users with overdue keys.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {overdueKeys.length} overdue key(s) found
          </p>
          <button
            onClick={sendOverdueAlerts}
            disabled={sending || !emailConfig?.configured || overdueKeys.length === 0}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Overdue Alerts'}
          </button>
        </div>
      </div>

      {/* Overdue Keys List */}
      {overdueKeys.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold flex items-center mb-4">
            <Users className="h-5 w-5 mr-2" />
            Overdue Keys ({overdueKeys.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueKeys.map((key) => (
                  <tr key={key.keyId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key.keyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.userName}
                      <br />
                      <span className="text-xs text-gray-400">{key.userEmail}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.daysOverdue > 7 
                          ? 'bg-red-100 text-red-800'
                          : key.daysOverdue > 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {key.daysOverdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
