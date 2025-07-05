'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceWorkerRegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    registerServiceWorker();
    setupEventListeners();
    checkPendingTransactions();
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        setSwRegistered(true);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast.success('App updated! Refresh to use the latest version.');
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        toast.error('Failed to enable offline support');
      }
    }
  };

  const setupEventListeners = () => {
    // Online/offline status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Sync completion events
    const handleSyncCompleted = (event: CustomEvent) => {
      const { syncedCount, failedCount } = event.detail;
      setIsSyncing(false);
      
      if (syncedCount > 0) {
        toast.success(`${syncedCount} offline transactions synced successfully`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} transactions failed to sync`);
      }
      
      checkPendingTransactions();
    };

    window.addEventListener('syncCompleted', handleSyncCompleted as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('syncCompleted', handleSyncCompleted as EventListener);
    };
  };

  const checkPendingTransactions = async () => {
    try {
      // Dynamically import sync manager to avoid SSR issues
      const { syncManager } = await import('@/lib/sync-manager');
      const count = await syncManager.getPendingTransactionsCount();
      setPendingTransactions(count);
    } catch (error) {
      console.error('Failed to check pending transactions:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      // Dynamically import sync manager to avoid SSR issues
      const { syncManager } = await import('@/lib/sync-manager');
      await syncManager.forcSync();
      toast.success('Manual sync completed');
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Manual sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't render anything on server side or if service worker is not supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Pending Transactions Indicator */}
      {pendingTransactions > 0 && (
        <div className="fixed bottom-4 left-4 z-50 ml-20">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span>{pendingTransactions} pending</span>
            {isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="ml-2 p-1 hover:bg-yellow-200 rounded transition-colors"
                title="Sync now"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sync Status Indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing...</span>
          </div>
        </div>
      )}

      {/* Service Worker Status */}
      {swRegistered && (
        <div className="fixed top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Offline Ready</span>
          </div>
        </div>
      )}
    </>
  );
}
