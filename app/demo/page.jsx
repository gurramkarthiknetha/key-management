'use client';

import { useState } from 'react';
import { 
  Key, 
  Upload, 
  Building2, 
  History, 
  ScanLine, 
  Clock, 
  FileText, 
  BarChart3, 
  Users, 
  Bell,
  Sun,
  Moon,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

import {
  Header,
  BottomNavigation,
  Card,
  Button,
  Badge,
  NotificationBadge,
  NotificationDrawer,
  ThemeToggle,
  Modal
} from '../../components/ui';

import { useResponsive, useOrientation } from '../../lib/useResponsive';
import { useTheme } from '../../components/ui/ThemeProvider';
import ColorTest from '../../components/ui/ColorTest';

const DemoPage = () => {
  const [activeRole, setActiveRole] = useState('faculty');
  const [activeTab, setActiveTab] = useState('keys');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const deviceInfo = useResponsive();
  const orientation = useOrientation();
  const { theme, toggleTheme } = useTheme();

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Key Overdue',
      message: 'Physics Lab key is 2 days overdue',
      type: 'alert',
      timestamp: new Date(),
      read: false,
      category: 'Key Management'
    },
    {
      id: '2',
      title: 'New Assignment',
      message: 'You have been assigned Chemistry Lab key',
      type: 'info',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      category: 'Access Control'
    }
  ];

  const roleConfigs = {
    faculty: {
      color: 'faculty',
      items: [
        { id: 'keys', label: 'Keys', icon: <Key className="h-5 w-5" />, badge: 2 },
        { id: 'deposit', label: 'Deposit', icon: <Upload className="h-5 w-5" /> },
        { id: 'dept-keys', label: 'Dept Keys', icon: <Building2 className="h-5 w-5" /> },
        { id: 'history', label: 'History', icon: <History className="h-5 w-5" /> }
      ]
    },
    security: {
      color: 'security',
      items: [
        { id: 'scan', label: 'Scan', icon: <ScanLine className="h-5 w-5" /> },
        { id: 'pending', label: 'Pending', icon: <Clock className="h-5 w-5" />, badge: 3 },
        { id: 'logs', label: 'Today Logs', icon: <FileText className="h-5 w-5" /> }
      ]
    },
    hod: {
      color: 'hod',
      items: [
        { id: 'usage', label: 'Usage', icon: <BarChart3 className="h-5 w-5" /> },
        { id: 'access', label: 'Access', icon: <Users className="h-5 w-5" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> }
      ]
    },
    'security-head': {
      color: 'security-head',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" />, badge: 5 },
        { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
        { id: 'keys', label: 'Keys', icon: <Key className="h-5 w-5" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> }
      ]
    }
  };

  const currentConfig = roleConfigs[activeRole];

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-4 w-4" />;
    if (deviceInfo.isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="VNR Key Management Demo"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={() => setShowNotifications(true)}
        className="bg-surface border-b border-default"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              icon={<Bell className="h-5 w-5" />}
            />
            <NotificationBadge
              count={notifications.filter(n => !n.read).length}
              size="sm"
              className="absolute -top-2 -right-2"
            />
          </div>
          <ThemeToggle />
        </div>
      </Header>

      {/* Device Info Panel */}
      <div className="px-4 py-4 bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getDeviceIcon()}
            <span className="font-medium">
              {deviceInfo.breakpoint.toUpperCase()} • {orientation}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </Badge>
            {deviceInfo.isTouchDevice && (
              <Badge variant="success" size="sm">Touch</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Select Role to Demo</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(roleConfigs).map(([role, config]) => (
            <Button
              key={role}
              variant={activeRole === role ? 'primary' : 'ghost'}
              onClick={() => setActiveRole(role)}
              className="justify-start capitalize"
            >
              {role.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="px-4 space-y-6">
        {/* Welcome Card */}
        <Card role={currentConfig.color} className="text-center py-8">
          <div className={`w-16 h-16 bg-${currentConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">
            {activeRole.replace('-', ' ').toUpperCase()} Dashboard
          </h3>
          <p className="text-secondary">
            Mobile-first design with role-specific navigation and features
          </p>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card role={currentConfig.color} interactive>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${currentConfig.color}/20 rounded-lg flex items-center justify-center`}>
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">QR Code Integration</h4>
                <p className="text-sm text-secondary">Scan and generate QR codes</p>
              </div>
            </div>
          </Card>

          <Card role={currentConfig.color} interactive>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${currentConfig.color}/20 rounded-lg flex items-center justify-center`}>
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">Smart Notifications</h4>
                <p className="text-sm text-secondary">Real-time alerts and reminders</p>
              </div>
            </div>
          </Card>

          <Card role={currentConfig.color} interactive>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${currentConfig.color}/20 rounded-lg flex items-center justify-center`}>
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">Mobile Optimized</h4>
                <p className="text-sm text-secondary">Touch-friendly interface</p>
              </div>
            </div>
          </Card>

          <Card role={currentConfig.color} interactive onClick={() => setShowModal(true)}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${currentConfig.color}/20 rounded-lg flex items-center justify-center`}>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">Analytics & Reports</h4>
                <p className="text-sm text-secondary">Comprehensive insights</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Component Showcase */}
        <Card>
          <h3 className="font-semibold text-primary mb-4">UI Components</h3>
          <div className="space-y-4">
            {/* Buttons */}
            <div>
              <h4 className="text-sm font-medium text-secondary mb-2">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-sm font-medium text-secondary mb-2">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            {/* Notification Badges */}
            <div>
              <h4 className="text-sm font-medium text-secondary mb-2">Notification Badges</h4>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-secondary" />
                  <NotificationBadge count={3} size="sm" className="absolute -top-2 -right-2" />
                </div>
                <div className="relative">
                  <Bell className="h-6 w-6 text-secondary" />
                  <NotificationBadge count={99} size="sm" className="absolute -top-2 -right-2" />
                </div>
                <div className="relative">
                  <Bell className="h-6 w-6 text-secondary" />
                  <NotificationBadge count={1} size="sm" type="danger" className="absolute -top-2 -right-2" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Device Info */}
        <Card>
          <h3 className="font-semibold text-primary mb-4">Device Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-secondary">Device Type:</span>
              <div className="font-medium">
                {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
              </div>
            </div>
            <div>
              <span className="text-secondary">Breakpoint:</span>
              <div className="font-medium uppercase">{deviceInfo.breakpoint}</div>
            </div>
            <div>
              <span className="text-secondary">Orientation:</span>
              <div className="font-medium capitalize">{orientation}</div>
            </div>
            <div>
              <span className="text-secondary">Touch Device:</span>
              <div className="font-medium">{deviceInfo.isTouchDevice ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </Card>

        {/* Color Test Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Color System Test</h2>
          <ColorTest />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={currentConfig.items}
        activeItem={activeTab}
        onItemClick={(item) => setActiveTab(item.id)}
        variant={currentConfig.color}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole={activeRole}
        onMarkAsRead={(id) => console.log('Mark as read:', id)}
        onMarkAllAsRead={() => console.log('Mark all as read')}
        onDeleteNotification={(id) => console.log('Delete notification:', id)}
      />

      {/* Demo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Analytics Dashboard"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            This modal demonstrates the responsive modal component with proper mobile optimization.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-secondary">Today's Activity</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-success">156</div>
              <div className="text-sm text-secondary">This Week</div>
            </Card>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Close
            </Button>
            <Button variant="primary" className="flex-1">
              View Details
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DemoPage;
