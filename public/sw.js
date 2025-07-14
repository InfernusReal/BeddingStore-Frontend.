// BnS Store Service Worker
// Version 2.2.0 - Safe production version

const CACHE_NAME = 'bns-store-v2.2.0';

// Install event - minimal caching to prevent failures
self.addEventListener('install', (event) => {
  console.log('🚀 BnS Store Service Worker installing...');
  // Skip caching during install to prevent blocking
  self.skipWaiting();
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
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - pass through strategy (don't interfere with normal loading)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Skip extension requests
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:') {
    return;
  }
  
  // For production, just pass through all requests to avoid blocking
  // This prevents the service worker from causing blank pages
  event.respondWith(
    fetch(event.request).catch(() => {
      // Only try cache as last resort for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/') || new Response('App temporarily unavailable', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
      throw error;
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
