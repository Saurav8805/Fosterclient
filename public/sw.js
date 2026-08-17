// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'New Notification',
        body: event.data.text(),
        icon: '/LOGO-2.png',
        badge: '/LOGO-2.png'
      };
    }
  }

  const title = data.title || 'Foster Kids';
  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: data.icon || '/LOGO-2.png',
    badge: data.badge || '/LOGO-2.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification-' + Date.now(),
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/dashboard/notifications'
    },
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/LOGO-2.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/LOGO-2.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the app or focus existing tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data.url || '/dashboard/notifications';
        
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus().then(client => {
              if ('navigate' in client) {
                return client.navigate(url);
              }
            });
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
