'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Key, FileText, AlertTriangle, Plus, Edit, Trash2, Eye, Shield, Settings } from 'lucide-react';
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

const SecurityHeadDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State for data
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchKeys();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch overview analytics
      const analyticsResponse = await fetch('/api/hod/analytics?type=overview');
      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await analyticsResponse.json();

      setDashboardStats({
        totalKeys: analyticsData.totalKeys || 0,
        keysInUse: analyticsData.keysInUse || 0,
        overdueKeys: analyticsData.overdueKeys || 0,
        totalUsers: analyticsData.totalUsers || 0,
        activeUsers: analyticsData.totalUsers || 0, // Assuming all users are active
        securityStaff: 8, // This would come from a separate endpoint
        todayTransactions: analyticsData.todayTransactions || 0,
        weeklyTransactions: analyticsData.weeklyTransactions || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchKeys = async () => {
    setKeysLoading(true);
    try {
      // Fetch all keys for security head
      const response = await fetch('/api/admin/keys?includeStats=true');
      if (!response.ok) throw new Error('Failed to fetch keys');
      const data = await response.json();

      // Transform the data to match the UI format
      const transformedKeys = data.keys.map(key => ({
        id: key._id,
        keyName: key.name,
        labName: key.labName,
        labNumber: key.labNumber,
        department: key.department,
        status: key.currentStatus,
        currentHolder: key.currentAssignment?.facultyName || null,
        assignedDate: key.currentAssignment?.assignedDate || null,
        dueDate: key.currentAssignment?.dueDate || null,
        building: key.location?.building || 'Unknown',
        floor: key.location?.floor || 'Unknown',
        room: key.location?.room || key.labNumber,
        keyType: key.keyType || 'lab',
        requiresApproval: key.requiresApproval || false
      }));

      setKeysList(transformedKeys);
    } catch (error) {
      console.error('Error fetching keys:', error);
      // Set empty array on error
      setKeysList([]);
    } finally {
      setKeysLoading(false);
    }
  };

  const [overdueAlerts] = useState([
    {
      id: 'alert-001',
      keyName: 'Physics Lab Key',
      facultyName: 'Dr. Smith',
      department: 'Physics',
      daysOverdue: 3,
      lastContact: '2024-01-22'
    },
    {
      id: 'alert-002',
      keyName: 'Chemistry Lab Key',
      facultyName: 'Prof. Johnson',
      department: 'Chemistry',
      daysOverdue: 1,
      lastContact: '2024-01-24'
    }
  ]);

  const [usersList] = useState([
    {
      id: 'user-001',
      name: 'Dr. John Smith',
      email: 'smith@vnrvjiet.in',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active',
      lastLogin: '2024-01-25',
      keysAssigned: 2
    },
    {
      id: 'user-002',
      name: 'Security Guard 1',
      email: 'security1@vnrvjiet.in',
      role: 'security',
      department: 'Security',
      status: 'active',
      lastLogin: '2024-01-25',
      keysAssigned: 0
    }
  ]);

  const [keysList, setKeysList] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysFilter, setKeysFilter] = useState('all'); // all, available, assigned, by-block

  const [localNotifications] = useState([
    {
      id: 'notif-001',
      title: 'Multiple Overdue Keys',
      message: '3 keys are currently overdue and require immediate attention.',
      type: 'alert',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      category: 'Security Alert'
    },
    {
      id: 'notif-002',
      title: 'New User Registration',
      message: 'Dr. Michael Brown has registered and needs role assignment.',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      category: 'User Management'
    }
  ]);

  const bottomNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      badge: overdueAlerts.length
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'keys',
      label: 'Keys',
      icon: <Key className="h-5 w-5" />
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-security-head">{dashboardStats.totalKeys}</div>
          <div className="text-sm text-secondary">Total Keys</div>
        </Card>
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-warning">{dashboardStats.keysInUse}</div>
          <div className="text-sm text-secondary">In Use</div>
        </Card>
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-danger">{dashboardStats.overdueKeys}</div>
          <div className="text-sm text-secondary">Overdue</div>
        </Card>
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-info">{dashboardStats.todayTransactions}</div>
          <div className="text-sm text-secondary">Today</div>
        </Card>
      </div>

      {/* Overdue Alerts */}
      {overdueAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h3 className="font-semibold text-primary">Urgent Alerts</h3>
          </div>
          {overdueAlerts.map(alert => (
            <Card key={alert.id} variant="danger" className="border-l-4 border-l-danger">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-primary">{alert.keyName}</h4>
                  <p className="text-sm text-secondary">{alert.facultyName} • {alert.department}</p>
                  <p className="text-sm text-danger font-medium">
                    {alert.daysOverdue} days overdue
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Take Action
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card role="security-head" interactive className="text-center py-6">
          <Users className="h-8 w-8 text-security-head mx-auto mb-2" />
          <h3 className="font-medium text-primary">Manage Users</h3>
          <p className="text-sm text-secondary">Add, edit, or remove users</p>
        </Card>
        <Card role="security-head" interactive className="text-center py-6">
          <Key className="h-8 w-8 text-security-head mx-auto mb-2" />
          <h3 className="font-medium text-primary">Add New Key</h3>
          <p className="text-sm text-secondary">Register new laboratory keys</p>
        </Card>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-security-head">{dashboardStats.totalUsers}</div>
          <div className="text-sm text-secondary">Total Users</div>
        </Card>
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-success">{dashboardStats.activeUsers}</div>
          <div className="text-sm text-secondary">Active</div>
        </Card>
        <Card role="security-head" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-info">{dashboardStats.securityStaff}</div>
          <div className="text-sm text-secondary">Security Staff</div>
        </Card>
      </div>

      {/* Add User Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-primary">User Management</h3>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {usersList.map(user => (
          <Card key={user.id} role="security-head">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-security-head/20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-security-head" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary">{user.name}</h4>
                  <p className="text-sm text-secondary">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted">
                    <Badge variant="info" size="sm">{user.role}</Badge>
                    <span>{user.department}</span>
                    <span>Keys: {user.keysAssigned}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />} />
                <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderKeysTab = () => {
    // Filter keys based on current filter
    const filteredKeys = keysList.filter(key => {
      switch (keysFilter) {
        case 'available':
          return key.status === 'available';
        case 'assigned':
          return key.status === 'assigned';
        case 'a-block':
          return key.building === 'A Block';
        case 'b-block':
          return key.building === 'B Block';
        case 'c-block':
          return key.building === 'C Block';
        case 'd-block':
          return key.building === 'D Block';
        case 'pg-block':
          return key.building === 'PG Block';
        case 'e-block':
          return key.building === 'E Block';
        default:
          return true;
      }
    });

    // Group keys by building for better organization
    const keysByBuilding = filteredKeys.reduce((acc, key) => {
      const building = key.building || 'Other';
      if (!acc[building]) acc[building] = [];
      acc[building].push(key);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-primary">Key Management</h3>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/admin/keys/add')}
            >
              Add Key
            </Button>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Keys' },
              { key: 'available', label: 'Available' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'a-block', label: 'A Block' },
              { key: 'b-block', label: 'B Block' },
              { key: 'c-block', label: 'C Block' },
              { key: 'd-block', label: 'D Block' },
              { key: 'pg-block', label: 'PG Block' },
              { key: 'e-block', label: 'E Block' }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={keysFilter === filter.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setKeysFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card role="security-head" className="text-center py-3">
              <div className="text-lg font-bold text-primary">{keysList.length}</div>
              <div className="text-xs text-secondary">Total Keys</div>
            </Card>
            <Card role="security-head" className="text-center py-3">
              <div className="text-lg font-bold text-success">{keysList.filter(k => k.status === 'available').length}</div>
              <div className="text-xs text-secondary">Available</div>
            </Card>
            <Card role="security-head" className="text-center py-3">
              <div className="text-lg font-bold text-warning">{keysList.filter(k => k.status === 'assigned').length}</div>
              <div className="text-xs text-secondary">Assigned</div>
            </Card>
          </div>
        </div>

        {/* Loading state */}
        {keysLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-security-head mx-auto mb-4"></div>
            <p className="text-secondary">Loading keys...</p>
          </div>
        )}

        {/* Keys List */}
        {!keysLoading && (
          <div className="space-y-6">
            {Object.entries(keysByBuilding).map(([building, keys]) => (
              <div key={building}>
                <h4 className="font-medium text-primary mb-3 flex items-center">
                  <div className="w-2 h-2 bg-security-head rounded-full mr-2"></div>
                  {building} ({keys.length} keys)
                </h4>
                <div className="space-y-3">
                  {keys.map(key => (
                    <Card key={key.id} role="security-head">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-security-head/20 rounded-full flex items-center justify-center">
                            <Key className="h-5 w-5 text-security-head" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-primary">{key.keyName}</h5>
                            <p className="text-sm text-secondary">{key.labNumber} • {key.department}</p>
                            <p className="text-xs text-muted">{key.floor} • {key.room}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={key.status === 'available' ? 'success' :
                                        key.status === 'assigned' ? 'warning' :
                                        key.status === 'maintenance' ? 'info' : 'danger'}
                                size="sm"
                              >
                                {key.status === 'available' ? 'Available' :
                                 key.status === 'assigned' ? 'Assigned' :
                                 key.status === 'maintenance' ? 'Maintenance' : 'Lost'}
                              </Badge>
                              {key.requiresApproval && (
                                <Badge variant="info" size="sm">Requires Approval</Badge>
                              )}
                              {key.currentHolder && (
                                <span className="text-xs text-muted">with {key.currentHolder}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => router.push(`/admin/keys/${key.id}`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => router.push(`/admin/keys/${key.id}/edit`)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {filteredKeys.length === 0 && !keysLoading && (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-secondary">No keys found for the selected filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card role="security-head" interactive className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-security-head mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Usage Analytics</h3>
          <p className="text-sm text-secondary mb-4">
            Comprehensive usage patterns and trends
          </p>
          <Button variant="primary" size="sm">
            View Analytics
          </Button>
        </Card>

        <Card role="security-head" interactive className="text-center py-8">
          <FileText className="h-12 w-12 text-security-head mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">System Reports</h3>
          <p className="text-sm text-secondary mb-4">
            Generate detailed system reports
          </p>
          <Button variant="primary" size="sm">
            Generate Report
          </Button>
        </Card>

        <Card role="security-head" interactive className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-security-head mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Security Audit</h3>
          <p className="text-sm text-secondary mb-4">
            Security incidents and audit logs
          </p>
          <Button variant="primary" size="sm">
            View Audit
          </Button>
        </Card>

        <Card role="security-head" interactive className="text-center py-8">
          <Users className="h-12 w-12 text-security-head mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">User Activity</h3>
          <p className="text-sm text-secondary mb-4">
            Detailed user activity reports
          </p>
          <Button variant="primary" size="sm">
            View Activity
          </Button>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card role="security-head">
        <h3 className="font-semibold text-primary mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-security-head">{dashboardStats.weeklyTransactions}</div>
            <div className="text-sm text-secondary">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">95%</div>
            <div className="text-sm text-secondary">On-time Returns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">12</div>
            <div className="text-sm text-secondary">Delegations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info">8</div>
            <div className="text-sm text-secondary">New Users</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboardTab();
      case 'users': return renderUsersTab();
      case 'keys': return renderKeysTab();
      case 'reports': return renderReportsTab();
      default: return renderDashboardTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-security-head mx-auto mb-4"></div>
          <p className="text-secondary">Loading security dashboard...</p>
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

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="Security Head Dashboard"
        showNotifications={true}
        showProfile={true}
        onNotificationClick={handleNotificationClick}
        onProfileClick={() => router.push('/profile')}
        className="bg-surface border-b border-default"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
            />
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                size="sm"
                type="danger"
                className="absolute -top-2 -right-2"
              />
            )}
          </div>
          <ThemeToggle />
        </div>
      </Header>

      {/* Welcome Section */}
      <div className="px-4 py-6 bg-security-head/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-security-head rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Welcome, {user?.name || 'Security Head'}
            </h1>
            <p className="text-secondary">Security Operations Center</p>
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
        variant="security-head"
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole="security-head"
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />
    </div>
  );
};

export default SecurityHeadDashboard;
