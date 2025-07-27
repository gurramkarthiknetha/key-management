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
      case 'faculty': return <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'faculty_lab_staff': return <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'hod': return <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'security_staff': return <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'security_incharge': return <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default: return <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'faculty': return 'bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100';
      case 'security': return 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-100';
      case 'security-head': return 'bg-purple-50 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100';
      default: return 'bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-100';
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
      case 'security_head':
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 
                  hover:text-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <Button
                onClick={logout}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800
                  hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.userId}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleIcon(user?.role)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        User ID
                      </label>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-md text-gray-900 dark:text-white">
                        {user?.userId}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Role
                      </label>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-md text-gray-900 dark:text-white flex items-center space-x-2">
                        {getRoleIcon(user?.role)}
                        <span>{getRoleDisplayName(user?.role)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Account Status
                      </label>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-md">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-900">
                          Active
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Member Since
                      </label>
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-md text-gray-900 dark:text-white">
                        {formatDate(user?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Activity tracking coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Update your account password</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white
                          border-gray-200 dark:border-gray-700"
                      >
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preferences</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Manage your account preferences</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white
                          border-gray-200 dark:border-gray-700"
                      >
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
