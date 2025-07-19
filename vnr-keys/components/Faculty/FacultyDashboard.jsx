import { useState, useEffect } from 'react';
import { ScanLine, History, KeyRound, AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header, BottomNavigation } from '../ui';
import KeyCard from './KeyCard';
import QRModal from './QRModal';
import ShareModal from './ShareModal';
import ProfileModal from '../Profile/ProfileModal';
import { useAuth, useKeys } from '../../lib/useAuth';

const FacultyDashboard = () => {
  const [selectedQRKey, setSelectedQRKey] = useState(null);
  const [selectedShareKey, setSelectedShareKey] = useState(null);
  const [activeTab, setActiveTab] = useState('keys');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { keys, loading, error, getMyKeys, clearError } = useKeys();

  // Load faculty's assigned keys on component mount
  useEffect(() => {
    if (user?.role === 'faculty') {
      getMyKeys();
    }
  }, [user, getMyKeys]);

  const handleViewQR = (keyData) => {
    setSelectedQRKey(keyData);
  };

  const handleShare = (keyData) => {
    setSelectedShareKey(keyData);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleShareComplete = (keyData, selectedFaculty) => {
    console.log('Sharing key:', keyData.keyId, 'with faculty:', selectedFaculty);
    // Here you would implement the actual sharing logic
  };

  const bottomNavItems = [
    {
      id: 'keys',
      label: 'My Keys',
      icon: <KeyRound className="h-5 w-5" />,
    },
    {
      id: 'scanner',
      label: 'Scanner',
      icon: <ScanLine className="h-6 w-6" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="h-5 w-5" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
    },
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
    console.log('Navigation clicked:', item.id);

    if (item.id === 'profile') {
      router.push('/profile');
    }
    // Implement other navigation logic here
  };

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading your keys...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        <div>
          <h4 className="text-red-800 font-medium">Error loading keys</h4>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => {
              clearError();
              getMyKeys();
            }}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Faculty Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={handleNotificationClick}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.userId}!
          </h2>
          <p className="text-gray-600">
            You have {keys.length} key{keys.length !== 1 ? 's' : ''} assigned
          </p>
        </div>

        {/* Error State */}
        {error && <ErrorState />}

        {/* Keys Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Keys
          </h3>

          {loading ? (
            <LoadingState />
          ) : keys.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {keys.map((key) => (
                <KeyCard
                  key={key.id}
                  keyData={key}
                  onViewQR={handleViewQR}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <KeyRound className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Keys Assigned
              </h3>
              <p className="text-gray-600">
                You don't have any keys assigned at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {/* <div className="mb-6">
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
              <History className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                View History
              </span>
            </button>
          </div>
        </div> */}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={bottomNavItems}
        activeItem={activeTab}
        onItemClick={handleBottomNavClick}
      />

      {/* Modals */}
      <QRModal
        isOpen={!!selectedQRKey}
        onClose={() => setSelectedQRKey(null)}
        keyData={selectedQRKey}
      />

      <ShareModal
        isOpen={!!selectedShareKey}
        onClose={() => setSelectedShareKey(null)}
        keyData={selectedShareKey}
        onShare={handleShareComplete}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default FacultyDashboard;
