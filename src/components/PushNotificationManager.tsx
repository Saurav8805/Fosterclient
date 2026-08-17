'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * PushNotificationManager Component
 * 
 * Automatically initializes push notifications when user is logged in.
 * This component should be included in the root layout.
 */
export default function PushNotificationManager() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const { isSupported, isEnabled } = usePushNotifications(userId);

  useEffect(() => {
    if (userId && isSupported && isEnabled) {
      console.log('✅ Push notifications are enabled for user:', userId);
    } else if (userId && isSupported && !isEnabled) {
      console.log('⚠️ Push notifications available but not enabled. User needs to grant permission.');
    } else if (userId && !isSupported) {
      console.log('⚠️ Push notifications not supported on this device/browser');
    }
  }, [userId, isSupported, isEnabled]);

  // This component doesn't render anything visible
  return null;
}
