'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import wsManager from './websocket';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const listenersRef = useRef(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = wsManager.connect(user);
      
      if (socket) {
        // Set up connection status listeners
        const handleConnectionEstablished = () => {
          setIsConnected(true);
          setConnectionError(null);
        };

        const handleConnectionLost = ({ reason }) => {
          setIsConnected(false);
          setConnectionError(`Connection lost: ${reason}`);
        };

        const handleConnectionError = ({ error }) => {
          setIsConnected(false);
          setConnectionError(`Connection error: ${error.message}`);
        };

        const handleConnectionFailed = () => {
          setIsConnected(false);
          setConnectionError('Failed to establish connection after multiple attempts');
        };

        const handleNotification = ({ message, type }) => {
          const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
          };
          
          setNotifications(prev => [...prev.slice(-9), notification]); // Keep last 10 notifications
        };

        // Register listeners
        wsManager.on('connection:established', handleConnectionEstablished);
        wsManager.on('connection:lost', handleConnectionLost);
        wsManager.on('connection:error', handleConnectionError);
        wsManager.on('connection:failed', handleConnectionFailed);
        wsManager.on('notification:show', handleNotification);

        // Store listeners for cleanup
        listenersRef.current.set('connection:established', handleConnectionEstablished);
        listenersRef.current.set('connection:lost', handleConnectionLost);
        listenersRef.current.set('connection:error', handleConnectionError);
        listenersRef.current.set('connection:failed', handleConnectionFailed);
        listenersRef.current.set('notification:show', handleNotification);
      }
    }

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach((listener, event) => {
        wsManager.off(event, listener);
      });
      listenersRef.current.clear();
    };
  }, [isAuthenticated, user]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      wsManager.disconnect();
      setIsConnected(false);
      setConnectionError(null);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Event subscription hook
  const useWebSocketEvent = useCallback((event, callback, dependencies = []) => {
    useEffect(() => {
      if (isConnected) {
        wsManager.on(event, callback);
        return () => wsManager.off(event, callback);
      }
    }, [event, callback, isConnected, ...dependencies]);
  }, [isConnected]);

  // Key management event hooks
  const useKeyEvents = useCallback(() => {
    const [keyUpdates, setKeyUpdates] = useState([]);

    useWebSocketEvent('key:assigned', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'assigned', ...data }]);
    });

    useWebSocketEvent('key:returned', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'returned', ...data }]);
    });

    useWebSocketEvent('key:overdue', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'overdue', ...data }]);
    });

    useWebSocketEvent('key:status:updated', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'status_updated', ...data }]);
    });

    useWebSocketEvent('key:assignment:updated', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'assignment_updated', ...data }]);
    });

    useWebSocketEvent('key:overdue:alert', (data) => {
      setKeyUpdates(prev => [...prev, { type: 'overdue_alert', ...data }]);
    });

    return keyUpdates;
  }, [useWebSocketEvent]);

  // Emit functions
  const emitKeyStatusUpdate = useCallback((keyId, status) => {
    wsManager.emitKeyStatusUpdate(keyId, status);
  }, []);

  const emitKeyAssignment = useCallback((keyId, assignedTo, durationHours) => {
    wsManager.emitKeyAssignment(keyId, assignedTo, durationHours);
  }, []);

  const emitKeyReturn = useCallback((keyId) => {
    wsManager.emitKeyReturn(keyId);
  }, []);

  const emitTypingStart = useCallback((context) => {
    wsManager.emitTypingStart(context);
  }, []);

  const emitTypingStop = useCallback((context) => {
    wsManager.emitTypingStop(context);
  }, []);

  // Notification management
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Connection management
  const reconnect = useCallback(() => {
    if (isAuthenticated && user) {
      wsManager.disconnect();
      setTimeout(() => {
        wsManager.connect(user);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  const getConnectionStatus = useCallback(() => {
    return wsManager.getConnectionStatus();
  }, []);

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Event hooks
    useWebSocketEvent,
    useKeyEvents,
    
    // Emit functions
    emitKeyStatusUpdate,
    emitKeyAssignment,
    emitKeyReturn,
    emitTypingStart,
    emitTypingStop,
    
    // Notifications
    notifications,
    clearNotification,
    clearAllNotifications,
    
    // Connection management
    reconnect,
    getConnectionStatus
  };
};

// Specialized hooks for different user roles
export const useFacultyWebSocket = () => {
  const webSocket = useWebSocket();
  const keyUpdates = webSocket.useKeyEvents();
  
  // Filter events relevant to faculty
  const facultyKeyUpdates = keyUpdates.filter(update => 
    ['assigned', 'overdue'].includes(update.type)
  );
  
  return {
    ...webSocket,
    keyUpdates: facultyKeyUpdates
  };
};

export const useSecurityWebSocket = () => {
  const webSocket = useWebSocket();
  const keyUpdates = webSocket.useKeyEvents();
  
  // All key events are relevant to security personnel
  return {
    ...webSocket,
    keyUpdates
  };
};

export default useWebSocket;
