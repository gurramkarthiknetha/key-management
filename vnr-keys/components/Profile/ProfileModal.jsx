'use client';

import { useState, useEffect } from 'react';
import { X, User, Shield, Calendar, Edit2, Save, XCircle } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { Button } from '../ui';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    role: '',
    createdAt: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId || '',
        role: user.role || '',
        createdAt: user.createdAt || new Date().toISOString()
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // TODO: Implement profile update API call
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        userId: user.userId || '',
        role: user.role || '',
        createdAt: user.createdAt || new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'faculty': return 'Faculty Member';
      case 'security': return 'Security Personnel';
      case 'security-head': return 'Security Head';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty': return <User className="h-5 w-5 text-blue-600" />;
      case 'security': return <Shield className="h-5 w-5 text-green-600" />;
      case 'security-head': return <Shield className="h-5 w-5 text-purple-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{user?.userId}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {getRoleIcon(user?.role)}
              <span className="text-sm text-gray-600">{getRoleDisplayName(user?.role)}</span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled // User ID should not be editable
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {user?.userId}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 flex items-center space-x-2">
                {getRoleIcon(user?.role)}
                <span>{getRoleDisplayName(user?.role)}</span>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {isEditing ? (
            <div className="flex space-x-3 w-full">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3 w-full">
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
