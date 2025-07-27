'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Key, User, Settings, Mail, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  Header, 
  BottomNavigation, 
  Card, 
  Button, 
  Badge, 
  NotificationBadge,
  NotificationDrawer,
  ThemeToggle 
} from '../ui';
import { useAuth } from '../../lib/useAuth';
import { useNotifications } from '../../lib/NotificationContext';

const HODDashboard = () => {
  const [activeTab, setActiveTab] = useState('usage');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State for data
  const [analytics, setAnalytics] = useState({});
  const [keyUsage, setKeyUsage] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalytics();
    fetchFacultyData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/hod/analytics?type=overview');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);

      // Fetch key usage data
      const usageResponse = await fetch('/api/keys?type=all');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setKeyUsage(usageData.keys || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    }
  };

  const fetchFacultyData = async () => {
    try {
      const response = await fetch('/api/hod/faculty');
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      setFacultyList(data.faculty || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      setError('Failed to load faculty data');
      setLoading(false);
    }
  };

  const bottomNavItems = [
    {
      id: 'usage',
      label: 'Usage',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'access',
      label: 'Access',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleEditAccess = (faculty) => {
    setSelectedFaculty(faculty);
    setShowAccessModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_use': return 'warning';
      case 'available': return 'success';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_use': return 'In Use';
      case 'available': return 'Available';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hod mx-auto mb-4"></div>
          <p className="text-secondary">Loading HOD dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <Card className="text-center p-8">
          <div className="text-danger mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-primary mb-2">Error Loading Dashboard</h3>
          <p className="text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const renderUsageTab = () => (
    <div className="space-y-6">
      {/* Department Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-hod">{analytics.totalKeys || 0}</div>
          <div className="text-sm text-secondary">Total Keys</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-warning">{analytics.keysInUse || 0}</div>
          <div className="text-sm text-secondary">In Use</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-success">{analytics.availableKeys || 0}</div>
          <div className="text-sm text-secondary">Available</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-danger">{analytics.overdueKeys || 0}</div>
          <div className="text-sm text-secondary">Overdue</div>
        </Card>
      </div>

      {/* Key Usage List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Key Activity</h3>
        {keyUsage.map(key => (
          <Card key={key.id} role="hod">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-primary">{key.keyName}</h4>
                  <Badge variant={getStatusColor(key.status)} size="sm">
                    {getStatusLabel(key.status)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-secondary">
                  <div>Lab: {key.labNumber}</div>
                  {key.currentHolder && (
                    <div>Current holder: {key.currentHolder}</div>
                  )}
                  {key.status === 'in_use' && key.dueDate && (
                    <div>Due: {new Date(key.dueDate).toLocaleDateString()}</div>
                  )}
                  {key.status === 'available' && key.lastUsed && (
                    <div>Last used: {new Date(key.lastUsed).toLocaleDateString()}</div>
                  )}
                  <div>Usage: {key.usageHours} hours this week</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<Eye className="h-4 w-4" />}
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAccessTab = () => (
    <div className="space-y-6">
      {/* Faculty Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary">Faculty Access Control</h3>
          <p className="text-sm text-secondary">Manage key access for department faculty</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
        >
          Add Faculty
        </Button>
      </div>

      {/* Faculty List */}
      <div className="space-y-4">
        {facultyList.map(faculty => (
          <Card key={faculty.id} role="hod">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-hod/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-hod" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-primary">{faculty.name}</h4>
                  <p className="text-sm text-secondary">{faculty.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted">
                    <span>Access: {faculty.accessLevel}</span>
                    <span>Keys: {faculty.assignedKeys.length}</span>
                    <span>Last active: {new Date(faculty.lastActive).toLocaleDateString()}</span>
                  </div>
                  {faculty.assignedKeys.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-secondary mb-1">Assigned Keys:</div>
                      <div className="flex flex-wrap gap-1">
                        {faculty.assignedKeys.map(key => (
                          <Badge key={key} variant="info" size="sm">{key}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditAccess(faculty)}
                  icon={<Edit className="h-4 w-4" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card role="hod" interactive className="text-center py-8">
          <FileText className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Daily Summary</h3>
          <p className="text-sm text-secondary mb-4">
            Today's key usage and activities
          </p>
          <Button variant="primary" size="sm">
            Generate Report
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Weekly Analysis</h3>
          <p className="text-sm text-secondary mb-4">
            Comprehensive weekly usage patterns
          </p>
          <Button variant="primary" size="sm">
            View Analytics
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <Mail className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Email Reports</h3>
          <p className="text-sm text-secondary mb-4">
            Configure automated email reports
          </p>
          <Button variant="primary" size="sm">
            Setup Email
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <Users className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Faculty Report</h3>
          <p className="text-sm text-secondary mb-4">
            Individual faculty usage summary
          </p>
          <Button variant="primary" size="sm">
            Generate Report
          </Button>
        </Card>
      </div>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Recent Reports</h3>
        <Card role="hod">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-primary">Weekly Usage Report</h4>
              <p className="text-sm text-secondary">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="sm">
              Download
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'usage': return renderUsageTab();
      case 'access': return renderAccessTab();
      case 'reports': return renderReportsTab();
      default: return renderUsageTab();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="HOD Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={handleNotificationClick}
        onProfileClick={() => router.push('/profile')}
        className="bg-surface border-b border-default"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
            />
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                size="sm"
                className="absolute -top-2 -right-2"
              />
            )}
          </div>
          <ThemeToggle />
        </div>
      </Header>

      {/* Welcome Section */}
      <div className="px-4 py-6 bg-hod/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-hod rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0) || 'H'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Welcome, {user?.name || 'HOD'}
            </h1>
            <p className="text-secondary">
              {user?.department || 'Computer Science'} Department
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={bottomNavItems}
        activeItem={activeTab}
        onItemClick={handleBottomNavClick}
        variant="hod"
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole="hod"
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />
    </div>
  );
};

export default HODDashboard;
