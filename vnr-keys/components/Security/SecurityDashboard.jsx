import { useState, useEffect } from 'react';
import { Key, Users, AlertTriangle, CheckCircle, ScanLine, Search, RefreshCw } from 'lucide-react';
import { Header, BottomNavigation } from '../ui';
import StatsCard from './StatsCard';
import SecurityKeyCard from './SecurityKeyCard';
import KeyDetailModal from './KeyDetailModal';
import { useAuth, useKeys } from '../../lib/useAuth';

const SecurityDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('keys');

  const { user } = useAuth();
  const { keys, loading, error, getAllKeys, assignKey, returnKey, clearError } = useKeys();

  // Load all keys on component mount
  useEffect(() => {
    if (user?.role === 'security' || user?.role === 'security-head') {
      getAllKeys();
    }
  }, [user, getAllKeys]);

  // Filter keys based on search
  const filteredKeys = keys.filter(key =>
    key.keyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    keysTaken: keys.filter(key => key.status === 'assigned').length,
    keysPresent: keys.filter(key => key.status === 'available').length,
    overdueKeys: keys.filter(key => key.status === 'overdue').length,
    totalKeys: keys.length,
  };

  const handleKeyClick = (keyData) => {
    setSelectedKey(keyData);
  };

  const handleHandover = async (keyData) => {
    console.log('Handover key:', keyData.keyId);
    // Implement handover logic
  };

  const handleMarkDeposited = async (keyData) => {
    console.log('Mark deposited:', keyData.keyId);
    // Implement mark deposited logic
  };

  const bottomNavItems = [
    {
      id: 'scanner',
      label: 'QR Scanner',
      icon: <ScanLine className="h-5 w-5" />,
    },
    {
      id: 'keys',
      label: 'Keys',
      icon: <Key className="h-5 w-5" />,
    },
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
    console.log('Navigation clicked:', item.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Security Dashboard"
        showSearch={true}
        showNotifications={true}
        showProfile={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by Key ID or Faculty..."
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Stats Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Keys Taken"
              value={stats.keysTaken}
              icon={<Users className="h-5 w-5" />}
              color="warning"
              subtitle="Currently in use"
            />
            <StatsCard
              title="Keys Present"
              value={stats.keysPresent}
              icon={<CheckCircle className="h-5 w-5" />}
              color="success"
              subtitle="Available with security"
            />
          </div>
          
          {stats.overdueKeys > 0 && (
            <div className="mt-4">
              <StatsCard
                title="Overdue Keys"
                value={stats.overdueKeys}
                icon={<AlertTriangle className="h-5 w-5" />}
                color="danger"
                subtitle="Require immediate attention"
              />
            </div>
          )}
        </div>

        {/* Keys Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Keys ({filteredKeys.length})
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Keys Grid */}
          {filteredKeys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeys.map((key) => (
                <SecurityKeyCard
                  key={key.id}
                  keyData={key}
                  onClick={handleKeyClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No keys found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms.
                  </p>
                </>
              ) : (
                <>
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No keys available
                  </h3>
                  <p className="text-gray-600">
                    All keys are currently assigned or in use.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <ScanLine className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Scan QR Code
              </span>
            </button>
            <button className="p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                View Overdue
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={bottomNavItems}
        activeItem={activeTab}
        onItemClick={handleBottomNavClick}
      />

      {/* Key Detail Modal */}
      <KeyDetailModal
        isOpen={!!selectedKey}
        onClose={() => setSelectedKey(null)}
        keyData={selectedKey}
        onHandover={handleHandover}
        onMarkDeposited={handleMarkDeposited}
      />
    </div>
  );
};

export default SecurityDashboard;
