import { OfflineTransaction } from '@/types';

const DB_NAME = 'KeyManagementDB';
const DB_VERSION = 1;
const TRANSACTIONS_STORE = 'offlineTransactions';
const CACHE_STORE = 'cachedData';

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create offline transactions store
        if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
          const transactionStore = db.createObjectStore(TRANSACTIONS_STORE, { 
            keyPath: 'id' 
          });
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          transactionStore.createIndex('synced', 'synced', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
        }

        // Create cached data store
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { 
            keyPath: 'key' 
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async storeOfflineTransaction(transaction: OfflineTransaction): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      const request = store.add(transaction);
      
      request.onsuccess = () => {
        console.log('Offline transaction stored:', transaction.id);
        resolve(transaction.id);
      };
      
      request.onerror = () => {
        console.error('Failed to store offline transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async getOfflineTransactions(): Promise<OfflineTransaction[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readonly');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      const index = store.index('synced');
      
      const request = index.getAll(false);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Failed to get offline transactions:', request.error);
        reject(request.error);
      };
    });
  }

  async markTransactionSynced(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const transaction = getRequest.result;
        if (transaction) {
          transaction.synced = true;
          
          const putRequest = store.put(transaction);
          
          putRequest.onsuccess = () => {
            console.log('Transaction marked as synced:', id);
            resolve();
          };
          
          putRequest.onerror = () => {
            console.error('Failed to mark transaction as synced:', putRequest.error);
            reject(putRequest.error);
          };
        } else {
          reject(new Error('Transaction not found'));
        }
      };
      
      getRequest.onerror = () => {
        console.error('Failed to get transaction for sync update:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log('Transaction deleted:', id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to delete transaction:', request.error);
        reject(request.error);
      };
    });
  }

  async cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      
      const request = store.put(cacheEntry);
      
      request.onsuccess = () => {
        console.log('Data cached:', key);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to cache data:', request.error);
        reject(request.error);
      };
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([CACHE_STORE], 'readonly');
      const store = tx.objectStore(CACHE_STORE);
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if data has expired
        if (Date.now() > result.expiry) {
          // Delete expired data
          this.deleteCachedData(key);
          resolve(null);
          return;
        }
        
        console.log('Retrieved cached data:', key);
        resolve(result.data);
      };
      
      request.onerror = () => {
        console.error('Failed to get cached data:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteCachedData(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      
      const request = store.delete(key);
      
      request.onsuccess = () => {
        console.log('Cached data deleted:', key);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to delete cached data:', request.error);
        reject(request.error);
      };
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([CACHE_STORE], 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      const index = store.index('expiry');
      
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('Expired cache cleared');
          resolve();
        }
      };
      
      request.onerror = () => {
        console.error('Failed to clear expired cache:', request.error);
        reject(request.error);
      };
    });
  }

  generateTransactionId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Sync Manager Class
class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.isOnline = true;
      this.syncOfflineTransactions();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      this.isOnline = false;
    });
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

      for (const transaction of transactions) {
        try {
          await this.syncTransaction(transaction);
          await offlineStorage.markTransactionSynced(transaction.id);
          console.log(`Synced transaction: ${transaction.id}`);
        } catch (error) {
          console.error(`Failed to sync transaction ${transaction.id}:`, error);
          // Continue with other transactions
        }
      }

      console.log('Offline transaction sync completed');
    } catch (error) {
      console.error('Failed to sync offline transactions:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncTransaction(transaction: OfflineTransaction): Promise<void> {
    const response = await fetch('/api/sync/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Sync failed');
    }
  }

  isConnectionAvailable(): boolean {
    return this.isOnline;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instances
export const offlineStorage = new OfflineStorage();
export const syncManager = new SyncManager();
