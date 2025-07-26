import { useState } from 'react';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Button, Badge, Card } from '../ui';
import { getKeyStatusColor, formatDate } from '../../lib/utils';

const KeyManagementTable = ({ 
  keys = [], 
  onEdit, 
  onDelete, 
  onAdd,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredKeys = keys.filter(key => {
    const matchesSearch = key.keyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.keyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.labName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Key Management
        </h3>
        <Button
          variant="primary"
          onClick={onAdd}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Key
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Key ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Lab Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned To</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeys.map((key) => (
              <tr key={key.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{key.keyId}</div>
                    <div className="text-sm text-gray-500">{key.keyName}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">{key.labName}</td>
                <td className="py-3 px-4 text-gray-600">{key.department}</td>
                <td className="py-3 px-4">
                  <Badge variant={getKeyStatusColor(key.status)}>
                    {key.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {key.facultyName || '-'}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {key.dueDate ? formatDate(key.dueDate) : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(key)}
                      icon={<Edit className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(key)}
                      icon={<Trash2 className="h-4 w-4" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No keys found matching your criteria.</p>
        </div>
      )}
    </Card>
  );
};

export default KeyManagementTable;
