'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Key, User, Settings, Mail, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const HODDashboard = () => {
  const [activeTab, setActiveTab] = useState('usage');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State for data
  const [analytics, setAnalytics] = useState({});
  const [keyUsage, setKeyUsage] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [viewedFromReports, setViewedFromReports] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalytics();
    fetchFacultyData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hod/analytics?type=overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data.data || data);

      // Fetch key usage data
      const usageResponse = await fetch(`${API_BASE_URL}/keys?type=all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setKeyUsage(usageData.data?.keys || usageData.keys || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    }
  };

  const fetchFacultyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hod/faculty`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      setFacultyList(data.data?.faculty || data.faculty || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      setError('Failed to load faculty data');
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    setReportLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hod/reports?type=${reportType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();

      // Create CSV content for better readability
      let csvContent = '';
      const reportData = data.data;

      if (reportType === 'daily') {
        csvContent = `Daily Summary Report\nGenerated: ${reportData.generatedAt}\nPeriod: ${reportData.period.start}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Total Transactions,${reportData.summary.totalTransactions}\n`;
        csvContent += `Unique Users,${reportData.summary.uniqueUsers}\n`;
        csvContent += `Peak Usage Hour,${reportData.summary.peakUsageHour}\n`;
        csvContent += `Keys In Use,${reportData.summary.keysInUse}\n`;
        csvContent += `Overdue Keys,${reportData.summary.overdueKeys}\n\n`;
        csvContent += `Transactions\n`;
        csvContent += `Time,User,Action,Key\n`;
        reportData.transactions.forEach(t => {
          csvContent += `${t.time},${t.user},${t.action},${t.key}\n`;
        });
      } else if (reportType === 'faculty') {
        csvContent = `Faculty Usage Report\nGenerated: ${reportData.generatedAt}\nPeriod: ${reportData.period.start} to ${reportData.period.end}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Total Faculty,${reportData.summary.totalFaculty}\n`;
        csvContent += `Active Faculty,${reportData.summary.activeFaculty}\n`;
        csvContent += `Faculty With Keys,${reportData.summary.facultyWithKeys}\n\n`;
        csvContent += `Faculty Details\n`;
        csvContent += `Name,Email,Department,Total Usage,Keys Used,Last Activity,Status\n`;
        reportData.facultyDetails.forEach(f => {
          csvContent += `${f.name},${f.email},${f.department},${f.totalUsage},"${f.keysUsed.join(', ')}",${f.lastActivity},${f.status}\n`;
        });
      } else {
        csvContent = JSON.stringify(reportData, null, 2);
      }

      // Create downloadable file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Add to recent reports
      const newReport = {
        id: Date.now(),
        type: reportType,
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        generatedAt: new Date().toLocaleDateString(),
        size: `${Math.round(blob.size / 1024)}KB`
      };
      setRecentReports(prev => [newReport, ...prev.slice(0, 4)]);

      // Show success message
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewAnalytics = () => {
    console.log('View Analytics clicked - switching to usage tab');
    console.log('Current activeTab:', activeTab);

    // Set flag to show special message
    setViewedFromReports(true);

    // Switch to usage tab to show analytics
    setActiveTab('usage');

    // Scroll to top to show the tab change
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clear the flag after a few seconds
      setTimeout(() => setViewedFromReports(false), 3000);
    }, 100);
  };

  const handleSetupEmail = () => {
    alert('Email setup functionality will be implemented here. This would typically open a configuration modal.');
  };

  const bottomNavItems = [
    {
      id: 'usage',
      label: 'Usage',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'access',
      label: 'Access',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const handleBottomNavClick = (item) => {
    setActiveTab(item.id);
    // Clear the viewed from reports flag when switching tabs
    setViewedFromReports(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleEditAccess = (faculty) => {
    setSelectedFaculty(faculty);
    setShowAccessModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_use': return 'warning';
      case 'available': return 'success';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_use': return 'In Use';
      case 'available': return 'Available';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hod mx-auto mb-4"></div>
          <p className="text-secondary">Loading HOD dashboard...</p>
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

  const renderUsageTab = () => (
    <div className="space-y-6">
      {/* Tab Indicator */}
      <div className={`border rounded-lg p-3 text-center ${
        viewedFromReports
          ? 'bg-green-50 border-green-200 animate-pulse'
          : 'bg-hod/10 border-hod/20'
      }`}>
        <div className={`font-medium ${viewedFromReports ? 'text-green-700' : 'text-hod'}`}>
          {viewedFromReports ? '✅ Analytics View Activated!' : '📊 Usage Analytics Dashboard'}
        </div>
        <div className="text-sm text-secondary mt-1">
          {viewedFromReports
            ? 'You are now viewing the comprehensive analytics dashboard'
            : 'Department key usage overview and statistics'
          }
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-hod">{analytics.totalKeys || 0}</div>
          <div className="text-sm text-secondary">Total Keys</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-warning">{analytics.keysInUse || 0}</div>
          <div className="text-sm text-secondary">In Use</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-success">
            {(analytics.totalKeys || 0) - (analytics.keysInUse || 0) - (analytics.overdueKeys || 0)}
          </div>
          <div className="text-sm text-secondary">Available</div>
        </Card>
        <Card role="hod" padding="sm" className="text-center">
          <div className="text-2xl font-bold text-danger">{analytics.overdueKeys || 0}</div>
          <div className="text-sm text-secondary">Overdue</div>
        </Card>
      </div>

      {/* Department Breakdown */}
      {analytics.departmentBreakdown && (
        <div className="space-y-4">
          <h3 className="font-semibold text-primary">Department Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analytics.departmentBreakdown).map(([dept, data]) => (
              <Card key={dept} role="hod" padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-primary">{dept}</h4>
                    <p className="text-sm text-secondary">{data.keys} keys • {data.usage}% usage</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-hod">{data.keys}</div>
                    <div className="text-xs text-secondary">Keys</div>
                  </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-hod h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.usage}%` }}
                  ></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      {analytics.usageStats && (
        <div className="space-y-4">
          <h3 className="font-semibold text-primary">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card role="hod" padding="sm" className="text-center">
              <div className="text-lg font-bold text-hod">{analytics.usageStats.averageUsageDuration}</div>
              <div className="text-sm text-secondary">Avg Duration</div>
            </Card>
            <Card role="hod" padding="sm" className="text-center">
              <div className="text-lg font-bold text-hod">{analytics.usageStats.mostActiveDay}</div>
              <div className="text-sm text-secondary">Most Active Day</div>
            </Card>
            <Card role="hod" padding="sm" className="text-center">
              <div className="text-lg font-bold text-hod">
                {analytics.usageStats.peakHours ? analytics.usageStats.peakHours.join(', ') : 'N/A'}
              </div>
              <div className="text-sm text-secondary">Peak Hours</div>
            </Card>
          </div>
        </div>
      )}

      {/* Today's Activity */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Today's Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card role="hod" padding="sm" className="text-center">
            <div className="text-2xl font-bold text-hod">{analytics.todayTransactions || 0}</div>
            <div className="text-sm text-secondary">Today's Transactions</div>
          </Card>
          <Card role="hod" padding="sm" className="text-center">
            <div className="text-2xl font-bold text-hod">{analytics.weeklyTransactions || 0}</div>
            <div className="text-sm text-secondary">This Week</div>
          </Card>
        </div>
      </div>

      {/* Key Usage List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Key Activity</h3>
        {keyUsage.map(key => (
          <Card key={key.id} role="hod">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-primary">{key.keyName}</h4>
                  <Badge variant={getStatusColor(key.status)} size="sm">
                    {getStatusLabel(key.status)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-secondary">
                  <div>Lab: {key.labNumber}</div>
                  {key.currentHolder && (
                    <div>Current holder: {key.currentHolder}</div>
                  )}
                  {key.status === 'in_use' && key.dueDate && (
                    <div>Due: {new Date(key.dueDate).toLocaleDateString()}</div>
                  )}
                  {key.status === 'available' && key.lastUsed && (
                    <div>Last used: {new Date(key.lastUsed).toLocaleDateString()}</div>
                  )}
                  <div>Usage: {key.usageHours} hours this week</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<Eye className="h-4 w-4" />}
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAccessTab = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-secondary">Loading faculty data...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-danger mb-4">{error}</div>
            <Button variant="primary" onClick={fetchFacultyData}>
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Faculty Management Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary">Faculty Access Control</h3>
            <p className="text-sm text-secondary">Manage key access for department faculty</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
          >
            Add Faculty
          </Button>
        </div>

        {/* Faculty List */}
        <div className="space-y-4">
          {facultyList.length === 0 ? (
            <Card role="hod" className="text-center py-8">
              <Users className="h-12 w-12 text-hod mx-auto mb-4" />
              <h3 className="font-semibold text-primary mb-2">No Faculty Found</h3>
              <p className="text-sm text-secondary">
                No faculty members found in your department.
              </p>
            </Card>
          ) : (
            facultyList.map(faculty => (
              <Card key={faculty.id} role="hod">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-hod/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-hod" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{faculty.name || 'Unknown'}</h4>
                      <p className="text-sm text-secondary">{faculty.email || 'No email'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted">
                        <span>Access: {faculty.accessLevel || 'Standard'}</span>
                        <span>Keys: {faculty.assignedKeys?.length || 0}</span>
                        <span>Last active: {faculty.lastActivity ? new Date(faculty.lastActivity).toLocaleDateString() : 'Never'}</span>
                      </div>
                      {faculty.assignedKeys && faculty.assignedKeys.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-secondary mb-1">Assigned Keys:</div>
                          <div className="flex flex-wrap gap-1">
                            {faculty.assignedKeys.map((key, index) => (
                              <Badge key={`${faculty.id}-${key}-${index}`} variant="info" size="sm">{key}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAccess(faculty)}
                      icon={<Edit className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderReportsTab = () => (
    <div className="space-y-6">
      {reportLoading && (
        <div className="bg-hod/10 border border-hod/20 rounded-lg p-4 text-center">
          <div className="text-hod font-medium">Generating Report...</div>
          <div className="text-sm text-secondary mt-1">Please wait while we prepare your report</div>
        </div>
      )}

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card role="hod" interactive className="text-center py-8">
          <FileText className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Daily Summary</h3>
          <p className="text-sm text-secondary mb-4">
            Today's key usage and activities
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => generateReport('daily')}
            disabled={reportLoading}
          >
            {reportLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Weekly Analysis</h3>
          <p className="text-sm text-secondary mb-4">
            Comprehensive weekly usage patterns
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleViewAnalytics}
          >
            View Analytics
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <Mail className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Email Reports</h3>
          <p className="text-sm text-secondary mb-4">
            Configure automated email reports
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSetupEmail}
          >
            Setup Email
          </Button>
        </Card>

        <Card role="hod" interactive className="text-center py-8">
          <Users className="h-12 w-12 text-hod mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">Faculty Report</h3>
          <p className="text-sm text-secondary mb-4">
            Individual faculty usage summary
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => generateReport('faculty')}
            disabled={reportLoading}
          >
            {reportLoading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Card>
      </div>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary">Recent Reports</h3>
        {recentReports.length === 0 ? (
          <Card role="hod" className="text-center py-8">
            <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
            <p className="text-secondary">No reports generated yet</p>
            <p className="text-xs text-muted mt-1">Generate your first report using the options above</p>
          </Card>
        ) : (
          recentReports.map(report => (
            <Card key={report.id} role="hod">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-primary">{report.name}</h4>
                  <p className="text-sm text-secondary">Generated on {report.generatedAt} • {report.size}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert('Report download functionality implemented!')}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    console.log('Rendering content for activeTab:', activeTab);
    switch (activeTab) {
      case 'usage': return renderUsageTab();
      case 'access': return renderAccessTab();
      case 'reports': return renderReportsTab();
      default: return renderUsageTab();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background-secondary pb-20">
      {/* Header */}
      <Header
        title="HOD Dashboard"
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
                className="absolute -top-2 -right-2"
              />
            )}
          </div>
          <ThemeToggle />
        </div>
      </Header>

      {/* Welcome Section */}
      <div className="px-4 py-6 bg-hod/5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-hod rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0) || 'H'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">
              Welcome, {user?.name || 'HOD'}
            </h1>
            <p className="text-secondary">
              {user?.department || 'Computer Science'} Department
            </p>
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
        variant="hod"
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole="hod"
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />

      {/* Access Modal - Simple placeholder */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Edit Access - {selectedFaculty?.name}
            </h3>
            <p className="text-secondary mb-4">
              Access management functionality will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowAccessModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowAccessModal(false)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
