// Push Notification Service
class NotificationService {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async initialize() {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions = {
      icon: '/icon2.png',
      badge: '/icon2.png',
      vibrate: [200, 100, 200],
      tag: 'bns-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icon2.png'
        }
      ]
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      // Use service worker for better reliability
      await this.registration.showNotification(title, notificationOptions);
    } else {
      // Fallback to regular notification
      new Notification(title, notificationOptions);
    }
  }

  async showProductNotification(product) {
    await this.showNotification(
      `New Product: ${product.name}`,
      {
        body: `${product.description.substring(0, 100)}...`,
        icon: '/icon2.png',
        tag: 'new-product',
        data: { type: 'product', id: product.id, url: `/product/${product.id}` }
      }
    );
  }

  async showAnnouncementNotification(announcement) {
    await this.showNotification(
      'New Announcement',
      {
        body: announcement.description.substring(0, 100) + '...',
        icon: '/icon2.png',
        tag: 'new-announcement',
        data: { type: 'announcement', id: announcement.id, url: '/announcements' }
      }
    );
  }
}

export const notificationService = new NotificationService();
