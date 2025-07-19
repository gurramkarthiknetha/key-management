import { useState } from 'react';
import { BarChart3, Users, Key, AlertTriangle, Download, Mail } from 'lucide-react';
import { Header, Card, Button } from '../ui';
import AnalyticsChart from './AnalyticsChart';
import KeyManagementTable from './KeyManagementTable';
import UserManagement from './UserManagement';
import OverdueAlerts from './OverdueAlerts';
import { mockKeys, mockFaculty, mockSecurityPersonnel, mockAnalytics } from '../../lib/mockData';
import { getOverdueKeys } from '../../lib/mockData';

const SecurityHeadDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Prepare analytics data
  const keyStatusData = [
    { name: 'In Use', value: mockAnalytics.totalKeys - mockAnalytics.keysAvailable },
    { name: 'Available', value: mockAnalytics.keysAvailable },
    { name: 'Overdue', value: mockAnalytics.overdueKeys },
  ];

  const allUsers = [...mockFaculty, ...mockSecurityPersonnel];
  const overdueKeys = getOverdueKeys();

  const handleKeyEdit = (key) => {
    console.log('Edit key:', key);
  };

  const handleKeyDelete = (key) => {
    console.log('Delete key:', key);
  };

  const handleKeyAdd = () => {
    console.log('Add new key');
  };

  const handleUserAdd = () => {
    console.log('Add new user');
  };

  const handleUserEdit = (user) => {
    console.log('Edit user:', user);
  };

  const handleUserDelete = (user) => {
    console.log('Delete user:', user);
  };

  const handleNotifyFaculty = (key) => {
    console.log('Notify faculty for overdue key:', key);
  };

  const handleRevokeAccess = (key) => {
    console.log('Revoke access for key:', key);
  };

  const handleExportReport = () => {
    console.log('Export report');
  };

  const handleSendDailyReport = () => {
    console.log('Send daily report');
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'keys', label: 'Key Management', icon: <Key className="h-4 w-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
    { id: 'alerts', label: 'Overdue Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Security Head Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                <Key className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalKeys}</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Keys In Use</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.keysInUse}</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <Key className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.keysAvailable}</p>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overdueKeys}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsChart
                  type="pie"
                  data={keyStatusData}
                  title="Key Status Distribution"
                />
                <AnalyticsChart
                  type="line"
                  data={mockAnalytics.dailyCheckouts}
                  title="Daily Check-in/Check-out Trends"
                />
              </div>
              <AnalyticsChart
                type="bar"
                data={mockAnalytics.departmentUsage}
                title="Department Usage Statistics"
              />
              
              {/* Reports Section */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reports & Export</h3>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="primary"
                    onClick={handleExportReport}
                    icon={<Download className="h-4 w-4" />}
                  >
                    Export Full Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSendDailyReport}
                    icon={<Mail className="h-4 w-4" />}
                  >
                    Send Daily Report
                  </Button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'keys' && (
            <KeyManagementTable
              keys={mockKeys}
              onEdit={handleKeyEdit}
              onDelete={handleKeyDelete}
              onAdd={handleKeyAdd}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={allUsers}
              onAddUser={handleUserAdd}
              onEditUser={handleUserEdit}
              onDeleteUser={handleUserDelete}
            />
          )}

          {activeTab === 'alerts' && (
            <OverdueAlerts
              overdueKeys={overdueKeys}
              onNotifyFaculty={handleNotifyFaculty}
              onRevokeAccess={handleRevokeAccess}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityHeadDashboard;
