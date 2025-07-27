'use client';

import { useState } from 'react';
import { Share2, Search, User, Clock, MapPin, Key, Send, X } from 'lucide-react';
import { Modal, Button, Card, Badge } from '../ui';

const ShareModal = ({
  isOpen,
  onClose,
  keyData,
  onShare
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [duration, setDuration] = useState('1'); // hours
  const [message, setMessage] = useState('');

  // Mock faculty data - replace with actual API call
  const [facultyList] = useState([
    {
      id: 'fac-001',
      name: 'Dr. John Smith',
      email: 'john.smith@vnrvjiet.in',
      department: 'Computer Science',
      avatar: null
    },
    {
      id: 'fac-002',
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@vnrvjiet.in',
      department: 'Computer Science',
      avatar: null
    },
    {
      id: 'fac-003',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@vnrvjiet.in',
      department: 'Information Technology',
      avatar: null
    }
  ]);

  const filteredFaculty = facultyList.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShare = () => {
    if (!selectedFaculty) return;

    const shareData = {
      keyId: keyData.id,
      recipientId: selectedFaculty.id,
      duration: parseInt(duration),
      message: message.trim(),
      timestamp: Date.now()
    };

    onShare(shareData);
    onClose();
    
    // Reset form
    setSelectedFaculty(null);
    setSearchTerm('');
    setDuration('1');
    setMessage('');
  };

  const handleClose = () => {
    setSelectedFaculty(null);
    setSearchTerm('');
    setDuration('1');
    setMessage('');
    onClose();
  };

  if (!keyData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Share Key Access"
      size="lg"
    >
      <div className="space-y-6">
        {/* Key Information */}
        <Card role="faculty" padding="sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-faculty rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">{keyData.keyName}</h3>
              <div className="space-y-1 text-sm text-secondary">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{keyData.labName} ({keyData.labNumber})</span>
                </div>
                <Badge 
                  variant={keyData.accessType === 'permanent' ? 'success' : 'warning'}
                  size="sm"
                >
                  {keyData.accessType}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Faculty Search */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-primary">
            Select Faculty Member
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search faculty by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-default rounded-xl focus:ring-2 focus:ring-faculty focus:border-transparent text-primary"
            />
          </div>
        </div>

        {/* Faculty List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredFaculty.map(faculty => (
            <Card
              key={faculty.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedFaculty?.id === faculty.id 
                  ? 'border-faculty bg-faculty/10' 
                  : 'hover:border-faculty/50'
              }`}
              padding="sm"
              onClick={() => setSelectedFaculty(faculty)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-faculty/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-faculty" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-primary">{faculty.name}</h4>
                  <p className="text-sm text-secondary">{faculty.email}</p>
                  <p className="text-xs text-muted">{faculty.department}</p>
                </div>
                {selectedFaculty?.id === faculty.id && (
                  <div className="w-5 h-5 bg-faculty rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {filteredFaculty.length === 0 && (
            <div className="text-center py-8">
              <User className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-secondary">No faculty members found</p>
            </div>
          )}
        </div>

        {/* Duration Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-primary">
            Access Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['1', '2', '4', '8'].map(hours => (
              <Button
                key={hours}
                variant={duration === hours ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDuration(hours)}
                className="flex items-center justify-center space-x-1"
              >
                <Clock className="h-3 w-3" />
                <span>{hours}h</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Optional Message */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-primary">
            Message (Optional)
          </label>
          <textarea
            placeholder="Add a note for the recipient..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-default rounded-xl focus:ring-2 focus:ring-faculty focus:border-transparent text-primary resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
            icon={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={!selectedFaculty}
            className="flex-1"
            icon={<Send className="h-4 w-4" />}
          >
            Share Access
          </Button>
        </div>

        {/* Info Card */}
        <Card variant="info" padding="sm">
          <div className="text-sm space-y-2">
            <h4 className="font-medium text-primary">Sharing Guidelines:</h4>
            <ul className="space-y-1 text-secondary">
              <li>• Shared access is temporary and expires automatically</li>
              <li>• You remain responsible for the key during shared access</li>
              <li>• The recipient will receive a notification with access details</li>
              <li>• You can revoke access at any time from your history</li>
            </ul>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default ShareModal;
