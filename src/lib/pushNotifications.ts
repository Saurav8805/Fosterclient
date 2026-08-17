// Push Notification Utility

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('✅ Service Worker registered:', registration);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      const convertedVapidKey = vapidPublicKey 
        ? urlBase64ToUint8Array(vapidPublicKey)
        : null;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey || undefined
      });

      console.log('✅ Push subscription created:', subscription);
    } else {
      console.log('✅ Already subscribed to push notifications');
    }

    return subscription;
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error);
    return null;
  }
}

// Send subscription to backend
export async function sendSubscriptionToBackend(
  subscription: PushSubscription,
  userId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON()
      })
    });

    if (response.ok) {
      console.log('✅ Subscription sent to backend');
      return true;
    } else {
      console.error('❌ Failed to send subscription to backend');
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending subscription to backend:', error);
    return false;
  }
}

// Initialize push notifications
export async function initializePushNotifications(userId: string): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('⚠️ Push notifications not supported on this device');
    return false;
  }

  try {
    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('❌ Failed to register service worker');
      return false;
    }

    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications(registration);
    if (!subscription) {
      console.error('❌ Failed to subscribe to push notifications');
      return false;
    }

    // Send subscription to backend
    const sent = await sendSubscriptionToBackend(subscription, userId);
    if (!sent) {
      console.warn('⚠️ Failed to send subscription to backend');
      // Don't return false - local notifications will still work
    }

    console.log('🎉 Push notifications initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
    return false;
  }
}

// Show a local notification (fallback)
export async function showLocalNotification(
  title: string,
  body: string,
  url?: string
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      body,
      icon: '/LOGO-2.png',
      badge: '/LOGO-2.png',
      vibrate: [200, 100, 200],
      tag: 'notification-' + Date.now(),
      data: { url: url || '/dashboard/notifications' },
      requireInteraction: false
    });
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error unsubscribing from push notifications:', error);
    return false;
  }
}
