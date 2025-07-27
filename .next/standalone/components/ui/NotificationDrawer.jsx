'use client';

import { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';

const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  userRole = 'faculty'
}) => {
  const [filter, setFilter] = useState('all'); // all, unread, alerts

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-danger" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'info': return <Info className="h-5 w-5 text-info" />;
      default: return <Bell className="h-5 w-5 text-primary-600" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'alerts') return notification.type === 'alert' || notification.type === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      size="lg"
      className="max-h-[80vh]"
    >
      <div className="flex flex-col h-full">
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-default">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'alerts' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('alerts')}
            >
              Alerts
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No notifications
              </h3>
              <p className="text-secondary">
                {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-l-primary-600 bg-primary-50/30' : ''
                }`}
                padding="sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-primary mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-secondary mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted">
                          <span>{getTimeAgo(notification.timestamp)}</span>
                          {notification.category && (
                            <span className="px-2 py-1 bg-surface-secondary rounded-full">
                              {notification.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNotification(notification.id)}
                          icon={<Trash2 className="h-3 w-3" />}
                          className="text-danger hover:bg-danger/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDrawer;
