// BnS Store Service Worker
// Version 2.0.0 - Force cache refresh for UI changes

const CACHE_NAME = 'bns-store-v2.0.0';
const urlsToCache = [
  '/',
  '/products',
  '/cart',
  '/contact',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
  // Add more critical assets here
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🚀 BnS Store Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 BnS Store Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network first strategy for CSS/JS, cache for other resources
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and extension-specific requests
  if (event.request.method !== 'GET' || 
      url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:') {
    return;
  }
  
  // Network first strategy for CSS and JS files to ensure latest changes
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            // Cache the new version
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache first strategy for other resources
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          // Cache successful responses
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline cart actions, form submissions, etc.
  console.log('📱 Performing background sync...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from BnS Store!',
    icon: '/icon-192x192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BnS Store', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/products')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Handle different notification types
  const notificationData = event.notification.data;
  let urlToOpen = '/';
  
  if (notificationData) {
    if (notificationData.type === 'product') {
      urlToOpen = `/product/${notificationData.id}`;
    } else if (notificationData.type === 'announcement') {
      urlToOpen = '/announcements';
    }
  }
  
  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push events (for future server-sent notifications)
self.addEventListener('push', (event) => {
  console.log('📨 Push received:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon2.png',
    badge: '/icon2.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'bns-notification',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
