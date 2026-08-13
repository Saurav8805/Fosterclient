'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/api';

export default function HeaderContent() {
  const [userName, setUserName] = useState('');
  const [userDesignation, setUserDesignation] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

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

    if (uid) {
      fetchNotifications(uid);
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
  }, []);

  const fetchNotifications = async (uid: string) => {
    try {
      console.log('🔔 Fetching notifications for user:', uid);
      const res = await notificationsApi.list(uid) as { success: boolean; data?: { notifications: any[]; unreadCount: number } };
      console.log('🔔 Notifications response:', res);
      if (res.success && res.data) {
        // Show only the 7 most recent notifications in the dropdown
        const recentNotifications = (res.data.notifications || []).slice(0, 7);
        console.log('🔔 Setting notifications:', recentNotifications);
        setNotifications(recentNotifications);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log('❌ Error loading notifications:', err);
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

  return (
    <header className="flex-shrink-0 relative z-50">
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
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
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
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 transition-colors hover:bg-gray-50 cursor-pointer ${
                          n.read 
                            ? 'bg-white' 
                            : 'bg-blue-50 border-l-2 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-gray-900 mb-0.5 leading-snug">{n.title}</p>
                            <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{n.message}</p>
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
                          {!n.read && (
                            <div className="flex-shrink-0">
                              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
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