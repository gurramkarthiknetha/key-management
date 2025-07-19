import { useState } from 'react';
import { Search, UserPlus, Send } from 'lucide-react';
import { Modal, Button, Card } from '../ui';
import { mockFaculty } from '../../lib/mockData';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  keyData,
  onShare 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  if (!keyData) return null;

  const filteredFaculty = mockFaculty.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(prev => {
      const isSelected = prev.find(f => f.id === faculty.id);
      if (isSelected) {
        return prev.filter(f => f.id !== faculty.id);
      } else {
        return [...prev, faculty];
      }
    });
  };

  const handleShare = () => {
    if (selectedFaculty.length > 0) {
      onShare(keyData, selectedFaculty);
      setSelectedFaculty([]);
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Key Access"
      size="md"
    >
      <div>
        {/* Key Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">
            {keyData.labName}
          </h3>
          <p className="text-sm text-gray-600">
            {keyData.keyName} ({keyData.keyId})
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty by name, department, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Faculty */}
        {selectedFaculty.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Selected Faculty ({selectedFaculty.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFaculty.map(faculty => (
                <span
                  key={faculty.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {faculty.name}
                  <button
                    onClick={() => handleFacultySelect(faculty)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Faculty List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredFaculty.map(faculty => {
            const isSelected = selectedFaculty.find(f => f.id === faculty.id);
            return (
              <Card
                key={faculty.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'
                }`}
                padding="sm"
                onClick={() => handleFacultySelect(faculty)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {faculty.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {faculty.department}
                    </p>
                    <p className="text-xs text-gray-500">
                      {faculty.email}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {isSelected ? (
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={selectedFaculty.length === 0}
            icon={<Send className="h-4 w-4" />}
            className="flex-1"
          >
            Share Access ({selectedFaculty.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
