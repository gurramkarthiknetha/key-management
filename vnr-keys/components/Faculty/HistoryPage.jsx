'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  History, 
  Clock, 
  MapPin, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import { Header, Button, Card, Badge } from '../ui';
import { useHistory, useAuth } from '../../lib/useAuth';

const HistoryPage = () => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const { history, loading, error, pagination, clearError, getMyHistory } = useHistory();

  useEffect(() => {
    loadHistory();
  }, [page, filter]);

  const loadHistory = async () => {
    const params = {
      page,
      limit: 20
    };

    if (filter !== 'all') {
      params.action = filter;
    }

    await getMyHistory(params);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  const handleBack = () => {
    router.push('/faculty');
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'assigned':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'returned':
        return <ArrowLeft className="h-4 w-4 text-gray-600" />;
      case 'scanned':
      case 'access_granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'access_denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'assigned':
        return 'Key Assigned';
      case 'returned':
        return 'Key Returned';
      case 'scanned':
        return 'QR Scanned';
      case 'access_granted':
        return 'Access Granted';
      case 'access_denied':
        return 'Access Denied';
      default:
        return action;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return <Badge variant="success">Success</Badge>;
    } else {
      return <Badge variant="error">Failed</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'assigned', label: 'Assignments' },
    { value: 'scanned', label: 'QR Scans' },
    { value: 'access_granted', label: 'Access Granted' },
    { value: 'access_denied', label: 'Access Denied' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Access History"
        showBack={true}
        onBackClick={handleBack}
        showProfile={true}
        onProfileClick={() => router.push('/faculty/profile')}
      />

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your Access History
          </h2>
          <p className="text-gray-600">
            Track all your key assignments and access activities
          </p>
        </div>

        {/* Filter and Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Error Loading History</h4>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={() => {
                    clearError();
                    loadHistory();
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* History List */}
        {loading && history.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading history...</span>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(item.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {getActionLabel(item.action)}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      {item.keyId && (
                        <div className="text-sm text-gray-600 mb-2">
                          <p className="font-medium">{item.keyId.keyName || item.keyId.keyId}</p>
                          <p className="text-xs text-gray-500">
                            {item.keyId.labName} • {item.keyId.department}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.timestamp)}
                        </div>
                        
                        {item.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.location}
                          </div>
                        )}
                      </div>
                      
                      {item.notes && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Load More Button */}
            {pagination && page < pagination.pages && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {pagination && (
              <div className="text-center text-sm text-gray-500 pt-4">
                Showing {history.length} of {pagination.total} entries
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No History Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You don't have any access history yet."
                : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} found.`
              }
            </p>
            {filter !== 'all' && (
              <Button
                variant="outline"
                onClick={() => handleFilterChange('all')}
              >
                Show All Activity
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
