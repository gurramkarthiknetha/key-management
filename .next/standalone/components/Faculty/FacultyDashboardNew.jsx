'use client';

import { useState, useEffect } from 'react';
import { Key, Upload, Building2, History, Bell, Search, Filter, QrCode, Share2, Clock, MapPin } from 'lucide-react';
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
import QRModal from './QRModalNew';
import ShareModal from './ShareModalNew';
import HistoryPage from './HistoryPageNew';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('keys');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, permanent, temporary
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State for data
  const [myKeys, setMyKeys] = useState([]);
  const [deptKeys, setDeptKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchMyKeys();
    fetchDeptKeys();
  }, []);

  const fetchMyKeys = async () => {
    try {
      const response = await fetch('/api/keys?type=my-keys');
      if (!response.ok) throw new Error('Failed to fetch keys');
      const data = await response.json();
      setMyKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching my keys:', error);
      setError('Failed to load your keys');
    }
  };

  const fetchDeptKeys = async () => {
    try {
      const response = await fetch('/api/keys?type=dept-keys');
      if (!response.ok) throw new Error('Failed to fetch department keys');
      const data = await response.json();
      setDeptKeys(data.keys || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department keys:', error);
      setError('Failed to load department keys');
      setLoading(false);
    }
  };

  const bottomNavItems = [
    {
      id: 'keys',
      label: 'Keys',
      icon: <Key className="h-5 w-5" />,
      badge: myKeys.filter(k => k.isOverdue).length
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: <Upload className="h-5 w-5" />
    },
    {
      id: 'dept-keys',
      label: 'Dept Keys',
      icon: <Building2 className="h-5 w-5" />
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="h-5 w-5" />
    }
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleViewQR = async (key) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-qr',
          keyId: key.id,
          data: { action: 'collection' }
        })
      });

      if (!response.ok) throw new Error('Failed to generate QR code');
      const data = await response.json();

      setSelectedKey({ ...key, qrData: data.qrData });
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Show error toast
    }
  };

  const handleShareKey = (key) => {
    setSelectedKey(key);
    setShowShareModal(true);
  };

  const handleShareSubmit = async (shareData) => {
    try {
      const response = await fetch('/api/keys/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share-key',
          data: {
            keyId: selectedKey.id,
            keyName: selectedKey.keyName,
            labName: selectedKey.labName,
            recipientId: shareData.recipientId,
            recipientName: shareData.recipientName,
            duration: shareData.duration,
            message: shareData.message
          }
        })
      });

      if (!response.ok) throw new Error('Failed to share key');

      // Refresh data and show success message
      fetchMyKeys();
      setShowShareModal(false);
      setSelectedKey(null);
    } catch (error) {
      console.error('Error sharing key:', error);
      // Show error toast
    }
  };

  const filteredKeys = myKeys.filter(key => {
    const matchesSearch = key.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.labName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || key.accessType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-faculty mx-auto mb-4"></div>
          <p className="text-secondary">Loading your dashboard...</p>
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

  const renderKeysTab = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-default rounded-xl focus:ring-2 focus:ring-faculty focus:border-transparent text-primary"
          />
        </div>
        <Button
          variant={filterType !== 'all' ? 'primary' : 'ghost'}
          onClick={() => setFilterType(filterType === 'all' ? 'permanent' : 'all')}
          icon={<Filter className="h-4 w-4" />}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex space-x-2">
        {['all', 'permanent', 'temporary'].map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType(type)}
            className="capitalize"
          >
            {type === 'all' ? 'All Keys' : type}
          </Button>
        ))}
      </div>

      {/* Keys Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredKeys.map(key => (
          <Card
            key={key.id}
            role="faculty"
            className={`${key.isOverdue ? 'border-l-4 border-l-danger' : ''}`}
            interactive
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-primary">{key.keyName}</h3>
                  <Badge 
                    variant={key.accessType === 'permanent' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {key.accessType}
                  </Badge>
                  {key.isOverdue && (
                    <Badge variant="danger" size="sm">
                      Overdue
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-secondary">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{key.labName} ({key.labNumber})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewQR(key)}
                  icon={<QrCode className="h-4 w-4" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShareKey(key)}
                  icon={<Share2 className="h-4 w-4" />}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <Key className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No keys found</h3>
          <p className="text-secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'You have no assigned keys.'}
          </p>
        </div>
      )}
    </div>
  );

  const renderDepositTab = () => (
    <div className="space-y-4">
      <Card role="faculty" className="text-center py-8">
        <Upload className="h-12 w-12 text-faculty mx-auto mb-4" />
        <h3 className="text-lg font-medium text-primary mb-2">Deposit Keys</h3>
        <p className="text-secondary mb-6">
          Generate QR code to deposit keys with security
        </p>
        <Button variant="primary" size="lg">
          Generate Deposit QR
        </Button>
      </Card>
    </div>
  );

  const renderDeptKeysTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {deptKeys.map(key => (
          <Card key={key.id} role="faculty">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">{key.keyName}</h3>
                <p className="text-sm text-secondary">{key.labName}</p>
              </div>
              <Badge 
                variant={key.status === 'available' ? 'success' : 'warning'}
              >
                {key.status === 'available' ? 'Available' : `With ${key.currentHolder}`}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <Card role="faculty" className="text-center py-8">
        <History className="h-12 w-12 text-faculty mx-auto mb-4" />
        <h3 className="text-lg font-medium text-primary mb-2">Key History</h3>
        <p className="text-secondary">
          View your key usage history and logs
        </p>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'keys': return renderKeysTab();
      case 'deposit': return renderDepositTab();
      case 'dept-keys': return renderDeptKeysTab();
      case 'history': return renderHistoryTab();
      default: return renderKeysTab();
    }
  };

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="Faculty Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={handleNotificationClick}
        onProfileClick={() => router.push('/profile')}
        className="bg-surface border-b border-default"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-secondary" />
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
      <div className="px-4 py-6 bg-faculty/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-faculty rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0) || 'F'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Welcome, {user?.name || 'Faculty'}
            </h1>
            <p className="text-secondary">
              {user?.department || 'Computer Science Department'}
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
        variant="faculty"
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole="faculty"
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />

      {/* QR Modal */}
      {showQRModal && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedKey(null);
          }}
          keyData={selectedKey}
          mode="collection"
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedKey(null);
          }}
          keyData={selectedKey}
          onShare={handleShareSubmit}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
