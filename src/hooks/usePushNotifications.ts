'use client';

import { useEffect, useState } from 'react';
import { 
  initializePushNotifications, 
  isPushNotificationSupported,
  showLocalNotification 
} from '@/lib/pushNotifications';

export function usePushNotifications(userId: string | null) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
  }, []);

  useEffect(() => {
    if (userId && isSupported) {
      // Auto-initialize push notifications
      const initNotifications = async () => {
        setIsLoading(true);
        const enabled = await initializePushNotifications(userId);
        setIsEnabled(enabled);
        setIsLoading(false);
      };

      // Check if user has already granted permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          initNotifications();
        } else if (Notification.permission === 'default') {
          // Don't auto-request, wait for user action
          console.log('💡 Notification permission not requested yet');
        }
      }
    }
  }, [userId, isSupported]);

  const requestPermission = async () => {
    if (!userId || !isSupported) return false;

    setIsLoading(true);
    const enabled = await initializePushNotifications(userId);
    setIsEnabled(enabled);
    setIsLoading(false);
    return enabled;
  };

  const sendTestNotification = async () => {
    await showLocalNotification(
      'Test Notification',
      'Push notifications are working! 🎉',
      '/dashboard/notifications'
    );
  };

  return {
    isSupported,
    isEnabled,
    isLoading,
    requestPermission,
    sendTestNotification
  };
}
