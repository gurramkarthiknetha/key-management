const CACHE_NAME = 'key-management-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/security/checkout',
  '/security/checkin',
  '/dashboard/keys',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try to make the network request
    const response = await fetch(request);
    
    // If successful, return the response
    if (response.ok) {
      return response;
    }
    
    // If not successful, handle based on request type
    throw new Error(`HTTP ${response.status}`);
    
  } catch (error) {
    console.log('Network request failed, handling offline:', error);
    
    // Handle specific offline scenarios
    if (request.method === 'POST' && 
        (url.pathname.includes('/checkout') || url.pathname.includes('/checkin'))) {
      
      // Store the transaction for later sync
      await storeOfflineTransaction(request);
      
      // Return a success response to the client
      return new Response(JSON.stringify({
        success: true,
        offline: true,
        message: 'Transaction stored offline and will be synced when connection is restored'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For GET requests, try to return cached data
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline error response
    return new Response(JSON.stringify({
      success: false,
      offline: true,
      error: 'No internet connection and no cached data available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Store offline transaction in IndexedDB
async function storeOfflineTransaction(request) {
  try {
    const body = await request.text();
    const transaction = {
      id: generateId(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now(),
      synced: false
    };
    
    // Store in IndexedDB
    await storeInIndexedDB('offlineTransactions', transaction);
    
    console.log('Stored offline transaction:', transaction.id);
  } catch (error) {
    console.error('Failed to store offline transaction:', error);
  }
}

// IndexedDB helper functions
function storeInIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KeyManagementDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const addRequest = store.add(data);
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Listen for sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncOfflineTransactions());
  }
});

// Sync offline transactions when online
async function syncOfflineTransactions() {
  try {
    const transactions = await getOfflineTransactions();
    
    for (const transaction of transactions) {
      try {
        const response = await fetch(transaction.url, {
          method: transaction.method,
          headers: transaction.headers,
          body: transaction.body
        });
        
        if (response.ok) {
          await markTransactionSynced(transaction.id);
          console.log('Synced transaction:', transaction.id);
        }
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline transactions:', error);
  }
}

// Get offline transactions from IndexedDB
function getOfflineTransactions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KeyManagementDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineTransactions'], 'readonly');
      const store = transaction.objectStore(offlineTransactions);
      const index = store.index('synced');
      
      const getRequest = index.getAll(false);
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Mark transaction as synced
function markTransactionSynced(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KeyManagementDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineTransactions'], 'readwrite');
      const store = transaction.objectStore('offlineTransactions');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        data.synced = true;
        
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}
