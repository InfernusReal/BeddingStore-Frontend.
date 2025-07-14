// Script to unregister service worker - use this if you need to completely remove it
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('Service Worker unregistered:', boolean);
      });
    }
  });
  
  // Clear all caches
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    console.log('All caches cleared');
    // Reload the page to ensure clean state
    window.location.reload();
  });
}
