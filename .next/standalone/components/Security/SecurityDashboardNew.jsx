'use client';

import { useState, useEffect } from 'react';
import { ScanLine, Clock, FileText, AlertTriangle, CheckCircle, Key, User, Mail, Phone } from 'lucide-react';
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

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [showNotifications, setShowNotifications] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State for data
  const [pendingHandovers, setPendingHandovers] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingHandovers();
    fetchTodayLogs();
  }, []);

  const fetchPendingHandovers = async () => {
    try {
      const response = await fetch('/api/security/pending');
      if (!response.ok) throw new Error('Failed to fetch pending handovers');
      const data = await response.json();
      setPendingHandovers(data.pendingHandovers || []);
    } catch (error) {
      console.error('Error fetching pending handovers:', error);
      setError('Failed to load pending handovers');
    }
  };

  const fetchTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/security/scan?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch today logs');
      const data = await response.json();
      setTodayLogs(data.scanHistory || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching today logs:', error);
      setError('Failed to load today logs');
      setLoading(false);
    }
  };

  const bottomNavItems = [
    {
      id: 'scan',
      label: 'Scan',
      icon: <ScanLine className="h-5 w-5" />
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="h-5 w-5" />,
      badge: pendingHandovers.filter(p => p.isOverdue).length
    },
    {
      id: 'logs',
      label: 'Today Logs',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    // In a real implementation, this would open the camera for QR scanning
    // For demo purposes, we'll simulate a scan
    setTimeout(() => {
      // Simulate successful scan
      setScanResult({
        keyId: 'key-001',
        keyName: 'Computer Lab Key',
        facultyName: 'Dr. Smith',
        action: 'collection',
        timestamp: Date.now()
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirmAction = async () => {
    try {
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: scanResult.qrData || JSON.stringify(scanResult),
          action: scanResult.action
        })
      });

      if (!response.ok) throw new Error('Failed to process scan');

      const result = await response.json();

      // Refresh data and clear scan result
      fetchTodayLogs();
      fetchPendingHandovers();
      setScanResult(null);

      // Show success message
      console.log('Scan processed successfully:', result);
    } catch (error) {
      console.error('Error processing scan:', error);
      // Show error message
    }
  };

  const handleSendReminder = async (handover) => {
    try {
      const response = await fetch('/api/security/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-reminder',
          assignmentId: handover.id
        })
      });

      if (!response.ok) throw new Error('Failed to send reminder');

      const result = await response.json();

      // Refresh pending handovers
      fetchPendingHandovers();

      console.log('Reminder sent successfully:', result);
    } catch (error) {
      console.error('Error sending reminder:', error);
      // Show error message
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderScanTab = () => (
    <div className="space-y-6">
      {/* Scan Area */}
      <Card role="security" className="text-center py-12">
        {isScanning ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-security rounded-full flex items-center justify-center mx-auto animate-pulse">
              <ScanLine className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-primary">Scanning...</h3>
            <p className="text-secondary">Point camera at QR code</p>
          </div>
        ) : scanResult ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-primary">QR Code Scanned</h3>
            <div className="bg-surface-secondary rounded-lg p-4 text-left">
              <div className="space-y-2">
                <div><strong>Key:</strong> {scanResult.keyName}</div>
                <div><strong>Faculty:</strong> {scanResult.facultyName}</div>
                <div><strong>Action:</strong> {scanResult.action}</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setScanResult(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAction}
                className="flex-1"
              >
                Confirm {scanResult.action}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-security/20 rounded-full flex items-center justify-center mx-auto">
              <ScanLine className="h-8 w-8 text-security" />
            </div>
            <h3 className="text-lg font-medium text-primary">QR Scanner</h3>
            <p className="text-secondary mb-6">
              Scan faculty QR codes for key collection or deposit
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartScan}
              icon={<ScanLine className="h-5 w-5" />}
            >
              Start Scanning
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card role="security" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-success">{todayLogs.filter(l => l.type === 'collection').length}</div>
          <div className="text-sm text-secondary">Collections Today</div>
        </Card>
        <Card role="security" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-info">{todayLogs.filter(l => l.type === 'deposit').length}</div>
          <div className="text-sm text-secondary">Deposits Today</div>
        </Card>
      </div>
    </div>
  );

  const renderPendingTab = () => (
    <div className="space-y-4">
      {pendingHandovers.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">All Clear!</h3>
          <p className="text-secondary">No pending key handovers</p>
        </Card>
      ) : (
        pendingHandovers.map(handover => (
          <Card 
            key={handover.id} 
            role="security"
            className={handover.isOverdue ? 'border-l-4 border-l-danger' : ''}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-primary">{handover.keyName}</h3>
                  {handover.isOverdue && (
                    <Badge variant="danger" size="sm">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-secondary">{handover.labName}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-secondary mb-4">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>{handover.facultyName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>{handover.facultyEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>
                  Due: {handover.dueDate.toLocaleDateString()}
                  {handover.isOverdue && (
                    <span className="text-danger ml-1">
                      ({Math.floor((Date.now() - handover.dueDate) / (1000 * 60 * 60 * 24))} days overdue)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSendReminder(handover)}
                icon={<Mail className="h-3 w-3" />}
                className="flex-1"
              >
                Send Reminder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Phone className="h-3 w-3" />}
                className="flex-1"
              >
                Call Faculty
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">Today's Activity</h3>
        <Badge variant="info">{todayLogs.length} transactions</Badge>
      </div>

      {todayLogs.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No activity today</h3>
          <p className="text-secondary">Key transactions will appear here</p>
        </Card>
      ) : (
        todayLogs.map(log => (
          <Card key={log.id} role="security">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                log.type === 'collection' ? 'bg-success/20' : 'bg-info/20'
              }`}>
                {log.type === 'collection' ? 
                  <Key className="h-5 w-5 text-success" /> : 
                  <CheckCircle className="h-5 w-5 text-info" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-primary">{log.keyName}</h4>
                  <Badge 
                    variant={log.type === 'collection' ? 'success' : 'info'}
                    size="sm"
                  >
                    {log.type === 'collection' ? 'Collected' : 'Deposited'}
                  </Badge>
                </div>
                <p className="text-sm text-secondary">{log.facultyName}</p>
                <p className="text-xs text-muted">
                  {formatTime(log.timestamp)} • {getTimeAgo(log.timestamp)}
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'scan': return renderScanTab();
      case 'pending': return renderPendingTab();
      case 'logs': return renderLogsTab();
      default: return renderScanTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-security mx-auto mb-4"></div>
          <p className="text-secondary">Loading security dashboard...</p>
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

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="Security Dashboard"
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
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                size="sm"
                type="danger"
                className="absolute -top-2 -right-2"
              />
            )}
          </div>
          <ThemeToggle />
        </div>
      </Header>

      {/* Welcome Section */}
      <div className="px-4 py-6 bg-security/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-security rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0) || 'S'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Welcome, {user?.name || 'Security'}
            </h1>
            <p className="text-secondary">Security Personnel</p>
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
        variant="security"
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole="security"
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />
    </div>
  );
};

export default SecurityDashboard;
