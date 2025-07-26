'use client';

import { useState } from 'react';
import { History, Calendar, Filter, Download, Key, Upload, Share2, Clock, MapPin, User } from 'lucide-react';
import { Card, Button, Badge } from '../ui';

const HistoryPage = () => {
  const [filterType, setFilterType] = useState('all'); // all, collected, returned, shared
  const [dateRange, setDateRange] = useState('week'); // week, month, all

  // Mock history data - replace with actual API call
  const [historyData] = useState([
    {
      id: 'hist-001',
      type: 'collected',
      keyName: 'Lab Key A1',
      labName: 'Computer Lab 1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      details: 'Collected from security desk',
      securityPersonnel: 'John Security'
    },
    {
      id: 'hist-002',
      type: 'shared',
      keyName: 'Physics Lab Key',
      labName: 'Physics Lab',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      details: 'Shared with Dr. Smith for 4 hours',
      recipient: 'Dr. Smith',
      duration: '4 hours'
    },
    {
      id: 'hist-003',
      type: 'returned',
      keyName: 'Chemistry Lab Key',
      labName: 'Chemistry Lab',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      details: 'Returned to security desk',
      securityPersonnel: 'Jane Security'
    },
    {
      id: 'hist-004',
      type: 'collected',
      keyName: 'Server Room Key',
      labName: 'Server Room',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      details: 'Emergency access granted',
      securityPersonnel: 'Mike Security'
    }
  ]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'collected': return <Key className="h-4 w-4 text-success" />;
      case 'returned': return <Upload className="h-4 w-4 text-info" />;
      case 'shared': return <Share2 className="h-4 w-4 text-warning" />;
      default: return <History className="h-4 w-4 text-muted" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'collected': return <Badge variant="success" size="sm">Collected</Badge>;
      case 'returned': return <Badge variant="info" size="sm">Returned</Badge>;
      case 'shared': return <Badge variant="warning" size="sm">Shared</Badge>;
      default: return <Badge variant="default" size="sm">{type}</Badge>;
    }
  };

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredHistory = historyData.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const now = new Date();
      const itemDate = new Date(item.timestamp);
      const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      
      if (dateRange === 'week') matchesDate = daysDiff <= 7;
      if (dateRange === 'month') matchesDate = daysDiff <= 30;
    }
    
    return matchesType && matchesDate;
  });

  const handleExportHistory = () => {
    // Implement export functionality
    console.log('Exporting history...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Key History</h2>
          <p className="text-secondary">Track your key usage and activities</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportHistory}
          icon={<Download className="h-4 w-4" />}
        >
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card role="faculty" padding="sm">
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Activity Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Activities' },
                { value: 'collected', label: 'Collected' },
                { value: 'returned', label: 'Returned' },
                { value: 'shared', label: 'Shared' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={filterType === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Time Period
            </label>
            <div className="flex gap-2">
              {[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'all', label: 'All Time' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setDateRange(option.value)}
                  icon={<Calendar className="h-3 w-3" />}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card className="text-center py-12">
            <History className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No history found</h3>
            <p className="text-secondary">
              No activities match your current filters.
            </p>
          </Card>
        ) : (
          filteredHistory.map((item, index) => {
            const { date, time } = formatDateTime(item.timestamp);
            
            return (
              <Card key={item.id} role="faculty" className="relative">
                {/* Timeline connector */}
                {index < filteredHistory.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-border-light"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-faculty/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-primary">{item.keyName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-secondary">
                          <MapPin className="h-3 w-3" />
                          <span>{item.labName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTypeBadge(item.type)}
                        <div className="text-xs text-muted mt-1">
                          {getTimeAgo(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-secondary mb-3">{item.details}</p>
                    
                    {/* Additional Details */}
                    <div className="flex items-center space-x-4 text-xs text-muted">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{date} at {time}</span>
                      </div>
                      
                      {item.securityPersonnel && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>by {item.securityPersonnel}</span>
                        </div>
                      )}
                      
                      {item.recipient && (
                        <div className="flex items-center space-x-1">
                          <Share2 className="h-3 w-3" />
                          <span>with {item.recipient}</span>
                        </div>
                      )}
                      
                      {item.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>for {item.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <Card role="faculty">
        <h3 className="font-semibold text-primary mb-4">Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Activities', value: historyData.length, color: 'text-primary' },
            { label: 'Keys Collected', value: historyData.filter(h => h.type === 'collected').length, color: 'text-success' },
            { label: 'Keys Returned', value: historyData.filter(h => h.type === 'returned').length, color: 'text-info' },
            { label: 'Keys Shared', value: historyData.filter(h => h.type === 'shared').length, color: 'text-warning' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HistoryPage;
