'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthenticatedFetch } from '@/lib/auth-context';
import { Key as KeyType, KeyStatus, ApiResponse } from '@/types';
import { Key, Search, Filter, Plus, QrCode, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KeysPage() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [keys, setKeys] = useState<KeyType[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<KeyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<KeyStatus | 'all'>('all');

  useEffect(() => {
    fetchKeys();
  }, []);

  useEffect(() => {
    filterKeys();
  }, [keys, searchTerm, statusFilter]);

  const fetchKeys = async () => {
    try {
      const response = await authenticatedFetch('/api/keys');
      const result: ApiResponse = await response.json();

      if (result.success) {
        setKeys(result.data);
      } else {
        toast.error('Failed to load keys');
      }
    } catch (error) {
      console.error('Keys fetch error:', error);
      toast.error('Failed to load keys');
    } finally {
      setIsLoading(false);
    }
  };

  const filterKeys = () => {
    let filtered = keys;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(key =>
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.keyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(key => key.status === statusFilter);
    }

    setFilteredKeys(filtered);
  };

  const getStatusColor = (status: KeyStatus) => {
    switch (status) {
      case KeyStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case KeyStatus.ISSUED:
        return 'bg-yellow-100 text-yellow-800';
      case KeyStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case KeyStatus.LOST:
        return 'bg-gray-100 text-gray-800';
      case KeyStatus.DAMAGED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Key Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and track all keys in the system
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as KeyStatus | 'all')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value={KeyStatus.AVAILABLE}>Available</option>
                <option value={KeyStatus.ISSUED}>Issued</option>
                <option value={KeyStatus.OVERDUE}>Overdue</option>
                <option value={KeyStatus.LOST}>Lost</option>
                <option value={KeyStatus.DAMAGED}>Damaged</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {filteredKeys.length} of {keys.length} keys
            </div>
          </div>
        </div>

        {/* Keys Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Holder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeys.map((key) => (
                  <tr key={key._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Key className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                          <div className="text-sm text-gray-500">ID: {key.keyId}</div>
                          <div className="text-sm text-gray-500">Location: {key.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.currentHolder ? (
                        <div>
                          <div className="font-medium">{key.currentHolder.name}</div>
                          <div className="text-gray-500">{key.currentHolder.employeeId}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.dueDate ? (
                        <div className={key.status === KeyStatus.OVERDUE ? 'text-red-600 font-medium' : ''}>
                          {formatDate(key.dueDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <QrCode className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No keys found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new key to the system.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
