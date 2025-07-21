'use client';

import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  connect(user) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = Cookies.get('token') || Cookies.get('auth_token');

    if (!token) {
      console.warn('No authentication token found for WebSocket connection');
      return null;
    }

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers(user);
    return this.socket;
  }

  setupEventHandlers(user) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:established', { user });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      this.isConnected = false;
      this.emit('connection:lost', { reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }
      
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.emit('connection:error', { error });
      this.handleReconnection();
    });

    // Key management events
    this.socket.on('key:assigned', (data) => {
      console.log('🔑 Key assigned:', data);
      this.emit('key:assigned', data);
      this.showNotification(`Key "${data.keyName}" has been assigned to you`, 'info');
    });

    this.socket.on('key:returned', (data) => {
      console.log('🔑 Key returned:', data);
      this.emit('key:returned', data);
    });

    this.socket.on('key:overdue', (data) => {
      console.log('🔑 Key overdue:', data);
      this.emit('key:overdue', data);
      this.showNotification(`Key "${data.keyName}" is overdue!`, 'warning');
    });

    this.socket.on('key:status:updated', (data) => {
      console.log('🔑 Key status updated:', data);
      this.emit('key:status:updated', data);
    });

    this.socket.on('key:assignment:updated', (data) => {
      console.log('🔑 Key assignment updated:', data);
      this.emit('key:assignment:updated', data);
    });

    this.socket.on('key:overdue:alert', (data) => {
      console.log('🔑 Key overdue alert:', data);
      this.emit('key:overdue:alert', data);
      if (user?.role === 'security' || user?.role === 'security-head') {
        this.showNotification(`Key "${data.keyName}" held by ${data.holderName} is overdue!`, 'error');
      }
    });

    // System notifications
    this.socket.on('system:notification', (data) => {
      console.log('🔔 System notification:', data);
      this.emit('system:notification', data);
      this.showNotification(data.message, data.type);
    });

    // Typing indicators
    this.socket.on('typing:start', (data) => {
      this.emit('typing:start', data);
    });

    this.socket.on('typing:stop', (data) => {
      this.emit('typing:stop', data);
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      this.emit('connection:failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // WebSocket emit methods
  emitKeyStatusUpdate(keyId, status) {
    if (this.socket?.connected) {
      this.socket.emit('key:status:update', { keyId, status });
    }
  }

  emitKeyAssignment(keyId, assignedTo, durationHours) {
    if (this.socket?.connected) {
      this.socket.emit('key:assign', { keyId, assignedTo, durationHours });
    }
  }

  emitKeyReturn(keyId) {
    if (this.socket?.connected) {
      this.socket.emit('key:return', { keyId });
    }
  }

  emitTypingStart(context = {}) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', context);
    }
  }

  emitTypingStop(context = {}) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', context);
    }
  }

  // Utility methods
  showNotification(message, type = 'info') {
    // This can be customized to integrate with your notification system
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Key Management System', {
          body: message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Key Management System', {
              body: message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
    
    // Also emit as custom event for in-app notifications
    this.emit('notification:show', { message, type });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const wsManager = new WebSocketManager();

export default wsManager;
