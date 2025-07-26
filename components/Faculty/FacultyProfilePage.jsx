'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Key, 
  Clock, 
  LogOut,
  Settings,
  Bell,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Header, Button, Card, Badge } from '../ui';
import { useAuth, useKeys } from '../../lib/useAuth';

const FacultyProfilePage = () => {
  const [stats, setStats] = useState({
    totalKeys: 0,
    activeKeys: 0,
    totalScans: 0,
    lastActivity: null
  });
  
  const router = useRouter();
  const { user, logout } = useAuth();
  const { keys, getMyKeys } = useKeys();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      await getMyKeys();
      // Calculate stats from keys
      const activeKeys = keys.filter(key => key.status === 'assigned').length;
      setStats({
        totalKeys: keys.length,
        activeKeys,
        totalScans: 0, // This would come from history API
        lastActivity: keys.length > 0 ? keys[0].assignedDate : null
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleBack = () => {
    router.push('/faculty');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'faculty':
        return <Badge variant="primary">Faculty</Badge>;
      case 'faculty_lab_staff':
        return <Badge variant="secondary">Lab Staff</Badge>;
      case 'hod':
        return <Badge variant="success">HOD</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  const menuItems = [
    {
      icon: <Key className="h-5 w-5" />,
      title: 'My Keys',
      description: 'View and manage your assigned keys',
      action: () => router.push('/faculty')
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Access History',
      description: 'View your key access history',
      action: () => router.push('/faculty/history')
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Notifications',
      description: 'Manage notification preferences',
      action: () => console.log('Notifications')
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: 'Settings',
      description: 'App settings and preferences',
      action: () => console.log('Settings')
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'Help & Support',
      description: 'Get help and contact support',
      action: () => console.log('Help')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Profile"
        showBack={true}
        onBackClick={handleBack}
      />

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Profile Card */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {user?.userId || 'Faculty Member'}
            </h2>
            
            <div className="flex items-center justify-center mb-4">
              {getRoleBadge(user?.role)}
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                {user?.userId}@university.edu
              </div>
              <div className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                Member since {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {stats.activeKeys}
            </div>
            <div className="text-sm text-gray-600">Active Keys</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.totalScans}
            </div>
            <div className="text-sm text-gray-600">Total Scans</div>
          </Card>
        </div>

        {/* Last Activity */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Last Activity</h3>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {stats.lastActivity ? formatDate(stats.lastActivity) : 'No recent activity'}
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="p-0 overflow-hidden">
              <button
                onClick={item.action}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="text-gray-600 mr-3">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <Card className="p-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>VNR Key Management System</p>
          <p>Version 1.0.0</p>
        </div>
      </main>
    </div>
  );
};

export default FacultyProfilePage;
