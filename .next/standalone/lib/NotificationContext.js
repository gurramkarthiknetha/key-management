'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const NotificationContext = createContext();

// Notification types and their configurations
const NOTIFICATION_TYPES = {
  KEY_OVERDUE: {
    type: 'alert',
    priority: 'high',
    roles: ['faculty', 'hod', 'security_head'],
    autoExpire: false
  },
  KEY_ASSIGNMENT: {
    type: 'info',
    priority: 'medium',
    roles: ['faculty'],
    autoExpire: true,
    expireAfter: 24 * 60 * 60 * 1000 // 24 hours
  },
  KEY_DELEGATION: {
    type: 'info',
    priority: 'medium',
    roles: ['faculty', 'hod'],
    autoExpire: true,
    expireAfter: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  SECURITY_ALERT: {
    type: 'alert',
    priority: 'high',
    roles: ['security', 'security_head'],
    autoExpire: false
  },
  SYSTEM_MAINTENANCE: {
    type: 'warning',
    priority: 'medium',
    roles: ['faculty', 'security', 'hod', 'security_head'],
    autoExpire: true,
    expireAfter: 2 * 60 * 60 * 1000 // 2 hours
  },
  REPORT_READY: {
    type: 'success',
    priority: 'low',
    roles: ['hod', 'security_head'],
    autoExpire: true,
    expireAfter: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      };

    case 'DELETE_NOTIFICATION':
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
        unreadCount: notification && !notification.read ? 
          Math.max(0, state.unreadCount - 1) : state.unreadCount
      };

    case 'CLEAR_EXPIRED':
      const now = Date.now();
      const activeNotifications = state.notifications.filter(notif => {
        if (!notif.expiresAt) return true;
        return notif.expiresAt > now;
      });
      
      const expiredUnreadCount = state.notifications
        .filter(notif => notif.expiresAt && notif.expiresAt <= now && !notif.read)
        .length;

      return {
        ...state,
        notifications: activeNotifications,
        unreadCount: Math.max(0, state.unreadCount - expiredUnreadCount)
      };

    case 'SET_NOTIFICATIONS':
      const unread = action.payload.filter(notif => !notif.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount: unread
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0
};

export const NotificationProvider = ({ children, userRole }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Auto-clear expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAR_EXPIRED' });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Generate notification ID
  const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add notification
  const addNotification = (notificationData) => {
    const config = NOTIFICATION_TYPES[notificationData.notificationType] || {
      type: 'info',
      priority: 'medium',
      roles: ['faculty', 'security', 'hod', 'security_head'],
      autoExpire: false
    };

    // Check if notification is relevant for current user role
    if (!config.roles.includes(userRole)) {
      return;
    }

    const notification = {
      id: generateId(),
      title: notificationData.title,
      message: notificationData.message,
      type: config.type,
      priority: config.priority,
      category: notificationData.category || 'General',
      timestamp: new Date(),
      read: false,
      expiresAt: config.autoExpire ? 
        Date.now() + config.expireAfter : null,
      data: notificationData.data || {}
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Show browser notification if permission granted
    if (Notification.permission === 'granted' && config.priority === 'high') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/VNRVJIETLOGO.png',
        tag: notification.id
      });
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Role-specific notification generators
  const notificationGenerators = {
    // Faculty notifications
    keyOverdueReminder: (keyName, daysOverdue) => addNotification({
      notificationType: 'KEY_OVERDUE',
      title: 'Key Return Reminder',
      message: `${keyName} is ${daysOverdue} day(s) overdue. Please return immediately.`,
      category: 'Key Management',
      data: { keyName, daysOverdue }
    }),

    keyAssigned: (keyName, labName) => addNotification({
      notificationType: 'KEY_ASSIGNMENT',
      title: 'New Key Assignment',
      message: `You have been assigned access to ${keyName} (${labName}).`,
      category: 'Key Management',
      data: { keyName, labName }
    }),

    keyDelegated: (keyName, fromFaculty, duration) => addNotification({
      notificationType: 'KEY_DELEGATION',
      title: 'Key Access Shared',
      message: `${fromFaculty} has shared ${keyName} access with you for ${duration}.`,
      category: 'Key Sharing',
      data: { keyName, fromFaculty, duration }
    }),

    // Security notifications
    overdueAlert: (keyName, facultyName, daysOverdue) => addNotification({
      notificationType: 'SECURITY_ALERT',
      title: 'Overdue Key Alert',
      message: `${keyName} is ${daysOverdue} day(s) overdue. Faculty: ${facultyName}`,
      category: 'Security Alert',
      data: { keyName, facultyName, daysOverdue }
    }),

    // HOD notifications
    departmentReport: (reportType, period) => addNotification({
      notificationType: 'REPORT_READY',
      title: 'Department Report Ready',
      message: `${reportType} report for ${period} is ready for review.`,
      category: 'Reports',
      data: { reportType, period }
    }),

    // System notifications
    maintenanceAlert: (startTime, duration) => addNotification({
      notificationType: 'SYSTEM_MAINTENANCE',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime}. Duration: ${duration}.`,
      category: 'System',
      data: { startTime, duration }
    })
  };

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    ...notificationGenerators
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
