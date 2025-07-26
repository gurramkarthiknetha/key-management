'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  Calendar, 
  Edit2, 
  Save, 
  ArrowLeft, 
  Key,
  Activity,
  Settings,
  Lock
} from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { AnyAuthenticatedRoute } from '../../components/ProtectedRoute';
import { Button } from '../../components/ui';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'faculty': return 'Faculty Member';
      case 'faculty_lab_staff': return 'Faculty Lab Staff';
      case 'hod': return 'Head of Department';
      case 'security_staff': return 'Security Personnel';
      case 'security_incharge': return 'Security Incharge';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty': return <User className="h-5 w-5 text-primary-600" />;
      case 'faculty_lab_staff': return <User className="h-5 w-5 text-primary-600" />;
      case 'hod': return <User className="h-5 w-5 text-purple-600" />;
      case 'security_staff': return <Shield className="h-5 w-5 text-green-600" />;
      case 'security_incharge': return <Shield className="h-5 w-5 text-purple-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'faculty': return 'bg-primary-100 text-primary-800';
      case 'security': return 'bg-green-100 text-green-800';
      case 'security-head': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    // Navigate back to the appropriate dashboard based on role
    switch (user?.role) {
      case 'faculty':
      case 'faculty_lab_staff':
      case 'hod':
        router.push('/faculty');
        break;
      case 'security_staff':
        router.push('/security');
        break;
      case 'security_incharge':
        router.push('/securityincharge');
        break;
      default:
        router.push('/');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AnyAuthenticatedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-gray-500" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user?.userId}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleIcon(user?.role)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {user?.userId}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 flex items-center space-x-2">
                        {getRoleIcon(user?.role)}
                        <span>{getRoleDisplayName(user?.role)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {formatDate(user?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Activity tracking coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                          <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Preferences</h4>
                          <p className="text-sm text-gray-500">Manage your account preferences</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnyAuthenticatedRoute>
  );
};

export default ProfilePage;
