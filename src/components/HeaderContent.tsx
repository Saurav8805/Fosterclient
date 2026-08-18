'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function HeaderContent() {
  const [userName, setUserName] = useState('');
  const [userDesignation, setUserDesignation] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [translatedNotifications, setTranslatedNotifications] = useState<Map<string, any>>(new Map());

  // Initialize push notifications
  const { isSupported, isEnabled, requestPermission } = usePushNotifications(userId);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // Refs to prevent duplicate calls
  const notificationsFetched = useRef(false);
  const serviceWorkerListenerAdded = useRef(false);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const mobile = localStorage.getItem('userMobile');
    const designation = localStorage.getItem('userDesignation');
    const role = localStorage.getItem('userRole');
    const uid = localStorage.getItem('userId') || '';
    setUserId(uid);
    
    if (name) {
      setUserName(name);
    } else if (mobile) {
      setUserName(mobile);
    }
    
    if (role) setUserRole(Number(role));
    
    if (designation) {
      setUserDesignation(designation);
    } else if (role) {
      const roleNum = Number(role);
      if (roleNum === 6) {
        setUserDesignation('Administrator');
      } else if (roleNum === 7) {
        setUserDesignation('Faculty');
      } else if (roleNum === 19) {
        setUserDesignation('Student');
      }
    }

    // Fetch notifications only once
    if (uid && !notificationsFetched.current) {
      notificationsFetched.current = true;
      fetchNotifications(uid);
    }

    // Check if we should show push notification prompt
    if (uid && isSupported && !isEnabled) {
      const hasSeenPrompt = localStorage.getItem('pushNotificationPromptSeen');
      if (!hasSeenPrompt) {
        // Show prompt after 3 seconds
        setTimeout(() => setShowPushPrompt(true), 3000);
      }
    }

    // Listen for navigation messages from service worker (only once)
    if ('serviceWorker' in navigator && !serviceWorkerListenerAdded.current) {
      serviceWorkerListenerAdded.current = true;
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE') {
          window.location.href = event.data.url;
        }
      });
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSupported, isEnabled]);

  const fetchNotifications = async (uid: string) => {
    try {
      const res = await notificationsApi.list(uid) as { success: boolean; data?: { notifications: any[]; unreadCount: number } };
      if (res.success && res.data) {
        // Show only the 7 most recent notifications in the dropdown
        const recentNotifications = (res.data.notifications || []).slice(0, 7);
        setNotifications(recentNotifications);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Error loading notifications:', err);
      }
    }
  };

  const handleTranslateNotification = async (notificationId: string) => {
    // Check if already translated
    if (translatedNotifications.has(notificationId)) {
      // Toggle back to original
      setTranslatedNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(notificationId);
        return newMap;
      });
      return;
    }

    // Start translation
    setTranslatingIds(prev => new Set(prev).add(notificationId));

    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translate/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notifications: [notification],
          targetLang: 'mr'
        })
      });

      const data = await response.json();
      
      if (data.success && data.data?.notifications?.[0]) {
        setTranslatedNotifications(prev => {
          const newMap = new Map(prev);
          newMap.set(notificationId, data.data.notifications[0]);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkRead = async () => {
    console.log('🔔 Bell clicked, dropdown state:', !showDropdown);
    setShowDropdown(!showDropdown);
    if (unreadCount > 0 && userId) {
      try {
        await notificationsApi.readAll(userId);
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };

  const handleEnablePushNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      setShowPushPrompt(false);
      localStorage.setItem('pushNotificationPromptSeen', 'true');
      alert('✅ Push notifications enabled! You\'ll now receive notifications even when the app is closed.');
    } else {
      alert('❌ Unable to enable push notifications. Please check your browser settings.');
    }
  };

  const handleDismissPushPrompt = () => {
    setShowPushPrompt(false);
    localStorage.setItem('pushNotificationPromptSeen', 'true');
  };

  return (
    <header className="flex-shrink-0 relative z-50">
      {/* Push Notification Prompt */}
      {showPushPrompt && (
        <div className="fixed top-24 right-4 w-80 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl border-2 border-purple-200 z-[99999] p-4 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Enable Push Notifications</h3>
              <p className="text-xs text-gray-600 mb-3">Get notified instantly about important updates, even when the app is closed!</p>
              <div className="flex gap-2">
                <button
                  onClick={handleEnablePushNotifications}
                  className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Enable
                </button>
                <button
                  onClick={handleDismissPushPrompt}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-all"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 h-20 flex justify-between items-center">
        <div className="min-w-0 flex-1 mr-4">
          <h1 className="text-sm font-semibold text-gray-800 truncate">Welcome, {userName}</h1>
          {userDesignation && (
            <p className="text-[10px] text-gray-600 font-medium truncate">{userDesignation}</p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <button 
              onClick={handleMarkRead}
              className="relative p-2.5 text-gray-700 hover:bg-purple-50 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent hover:border-purple-200 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center leading-tight shadow-lg border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Popup */}
            {showDropdown && (
              <div className="fixed top-20 right-4 w-72 sm:w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-[99999] overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-900">Recent Notifications</h4>
                  <span className="text-[10px] font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full">Last 7</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const displayNotification = translatedNotifications.get(n.id) || n;
                      const isTranslated = translatedNotifications.has(n.id);
                      const isTranslating = translatingIds.has(n.id);
                      
                      return (
                        <div 
                          key={n.id} 
                          className={`p-3 transition-colors hover:bg-gray-50 ${
                            n.read 
                              ? 'bg-white' 
                              : 'bg-blue-50 border-l-2 border-blue-400'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-gray-900 mb-0.5 leading-snug">{displayNotification.title}</p>
                              <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{displayNotification.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                {new Date(n.created_at).toLocaleString('en-IN', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              {/* Translate Button */}
                              <button
                                onClick={() => handleTranslateNotification(n.id)}
                                disabled={isTranslating}
                                className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                                  isTranslated
                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isTranslated ? 'Show original (English)' : 'Translate to Marathi'}
                              >
                                {isTranslating ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-4 w-4" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                                  </svg>
                                )}
                              </button>
                              {/* Unread indicator */}
                              {!n.read && (
                                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No notifications yet</p>
                      <p className="text-[10px] text-gray-500">You're all caught up!</p>
                    </div>
                  )}
                </div>
                <Link 
                  href="/dashboard/notifications" 
                  onClick={() => setShowDropdown(false)}
                  className="block p-2.5 text-center bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200 hover:from-purple-100 hover:to-blue-100 transition text-xs font-semibold text-[#5e3a9e]"
                >
                  View All Notifications →
                </Link>
              </div>
            )}
          </div>

          <Link href="/dashboard/profile" className="flex items-center">
            <div className="w-9 h-9 bg-[#5e3a9e] rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-[#4a2d7e] transition">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}