import { useState } from 'react';
import { User, UserPlus, Edit, Trash2, Search, Shield } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { getRoleDisplayName } from '../../lib/utils';

const UserManagement = ({ 
  users = [], 
  onAddUser, 
  onEditUser, 
  onDeleteUser,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'security_incharge': return 'danger';
      case 'security_staff': return 'warning';
      case 'faculty': return 'primary';
      case 'faculty_lab_staff': return 'primary';
      case 'hod': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            User Management
          </h3>
        </div>
        <Button
          variant="primary"
          onClick={onAddUser}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="faculty">Faculty</option>
          <option value="security">Security</option>
          <option value="security-head">Security Head</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUser(user)}
                  icon={<Edit className="h-3 w-3" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteUser(user)}
                  icon={<Trash2 className="h-3 w-3" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
              
              {user.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm text-gray-900">{user.department}</span>
                </div>
              )}
              
              {user.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm text-gray-900">{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge 
                  variant={user.status === 'active' ? 'success' : 'default'} 
                  size="sm"
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}
    </Card>
  );
};

export default UserManagement;
