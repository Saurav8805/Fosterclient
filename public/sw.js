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
        title: 'Foster Kids Notification',
        body: event.data.text(),
        icon: '/LOGO-2.png',
        badge: '/LOGO-2.png'
      };
    }
  }

  const title = data.title || 'Foster Kids';
  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: '/LOGO-2.png', // 192x192 or larger for best display
    badge: '/LOGO-2.png', // 96x96 monochrome for notification tray
    image: data.image || null, // Optional large image
    tag: data.tag || 'foster-kids-notification', // Group similar notifications
    renotify: false, // Don't vibrate/sound for updates to same tag
    requireInteraction: false, // Auto-dismiss after timeout
    silent: false, // Play default notification sound
    timestamp: data.timestamp || Date.now(),
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/dashboard/notifications',
      notificationId: data.notificationId || null
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
    // Additional metadata for better delivery
    dir: 'ltr', // Text direction
    lang: 'en-US', // Language
    // Visual appearance
    vibrate: [200, 100, 200], // Vibration pattern on mobile
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
  console.log('Notification closed:', event.notification.tag);
  
  // Optional: Track notification dismissal
  // You can send analytics here if needed
});
