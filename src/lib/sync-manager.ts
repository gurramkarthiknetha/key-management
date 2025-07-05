import { offlineStorage } from './offline-storage';
import { OfflineTransaction } from '@/types';

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInProgress: boolean = false;
  private syncQueue: OfflineTransaction[] = [];

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.initializeSync();
    }
  }

  private setupEventListeners(): void {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.isOnline = true;
      this.syncOfflineTransactions();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      this.isOnline = false;
    });

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      }).catch((error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  }

  private async initializeSync(): Promise<void> {
    // Initialize offline storage
    try {
      await offlineStorage.init();
      
      // Sync any pending transactions if online
      if (this.isOnline) {
        await this.syncOfflineTransactions();
      }
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
    }
  }

  async queueTransaction(transaction: Omit<OfflineTransaction, 'id' | 'synced'>): Promise<string> {
    const offlineTransaction: OfflineTransaction = {
      ...transaction,
      id: offlineStorage.generateTransactionId(),
      synced: false
    };

    try {
      await offlineStorage.storeOfflineTransaction(offlineTransaction);
      this.syncQueue.push(offlineTransaction);
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.syncOfflineTransactions();
      }
      
      return offlineTransaction.id;
    } catch (error) {
      console.error('Failed to queue transaction:', error);
      throw error;
    }
  }

  async syncOfflineTransactions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting offline transaction sync...');

    try {
      const transactions = await offlineStorage.getOfflineTransactions();
      console.log(`Found ${transactions.length} offline transactions to sync`);

      let syncedCount = 0;
      let failedCount = 0;

      for (const transaction of transactions) {
        try {
          await this.syncTransaction(transaction);
          await offlineStorage.markTransactionSynced(transaction.id);
          syncedCount++;
          console.log(`Synced transaction: ${transaction.id}`);
        } catch (error) {
          failedCount++;
          console.error(`Failed to sync transaction ${transaction.id}:`, error);
          // Continue with other transactions
        }
      }

      console.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      
      // Notify UI about sync completion
      this.notifySync(syncedCount, failedCount);
      
    } catch (error) {
      console.error('Failed to sync offline transactions:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncTransaction(transaction: OfflineTransaction): Promise<void> {
    let endpoint = '';
    let method = 'POST';
    let body: any = {};

    // Determine the correct API endpoint based on transaction type
    switch (transaction.type) {
      case 'check_out':
        endpoint = '/api/keys/checkout';
        body = {
          keyId: transaction.keyId,
          userId: transaction.userId,
          location: transaction.location,
          notes: transaction.notes,
          duration: transaction.duration || 24 // Default 24 hours
        };
        break;
      
      case 'check_in':
        endpoint = '/api/keys/checkin';
        body = {
          keyId: transaction.keyId,
          location: transaction.location,
          notes: transaction.notes,
          condition: transaction.condition || 'good'
        };
        break;
      
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Sync failed');
    }
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }

  private notifySync(syncedCount: number, failedCount: number): void {
    // Dispatch custom event for UI components to listen to
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('syncCompleted', {
        detail: { syncedCount, failedCount }
      });
      window.dispatchEvent(event);
    }
  }

  async getPendingTransactionsCount(): Promise<number> {
    try {
      const transactions = await offlineStorage.getOfflineTransactions();
      return transactions.length;
    } catch (error) {
      console.error('Failed to get pending transactions count:', error);
      return 0;
    }
  }

  isConnectionAvailable(): boolean {
    return this.isOnline;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  async clearSyncedTransactions(): Promise<void> {
    try {
      const transactions = await offlineStorage.getOfflineTransactions();
      const syncedTransactions = transactions.filter(t => t.synced);
      
      for (const transaction of syncedTransactions) {
        await offlineStorage.deleteTransaction(transaction.id);
      }
      
      console.log(`Cleared ${syncedTransactions.length} synced transactions`);
    } catch (error) {
      console.error('Failed to clear synced transactions:', error);
    }
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncOfflineTransactions();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
