import { useState } from 'react';
import { ScanLine, History, KeyRound } from 'lucide-react';
import { Header, BottomNavigation } from '../ui';
import KeyCard from './KeyCard';
import QRModal from './QRModal';
import ShareModal from './ShareModal';
import { getFacultyKeys } from '../../lib/mockData';

const FacultyDashboard = ({ facultyId = 'FAC001' }) => {
  const [selectedQRKey, setSelectedQRKey] = useState(null);
  const [selectedShareKey, setSelectedShareKey] = useState(null);
  const [activeTab, setActiveTab] = useState('keys');

  // Get faculty's assigned keys
  const facultyKeys = getFacultyKeys(facultyId);

  const handleViewQR = (keyData) => {
    setSelectedQRKey(keyData);
  };

  const handleShare = (keyData) => {
    setSelectedShareKey(keyData);
  };

  const handleShareComplete = (keyData, selectedFaculty) => {
    console.log('Sharing key:', keyData.keyId, 'with faculty:', selectedFaculty);
    // Here you would implement the actual sharing logic
  };

  const bottomNavItems = [
    {
      id: 'deposit',
      label: 'Deposit Key',
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
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
    console.log('Navigation clicked:', item.id);
    // Implement navigation logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Faculty Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            You have {facultyKeys.length} key{facultyKeys.length !== 1 ? 's' : ''} assigned
          </p>
        </div>

        {/* Keys Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Keys
          </h3>
          
          {facultyKeys.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {facultyKeys.map((key) => (
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
              <History className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                View History
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
    </div>
  );
};

export default FacultyDashboard;
