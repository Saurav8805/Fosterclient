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
  }, []);

  const fetchNotifications = async (uid: string) => {
    try {
      const res = await notificationsApi.list(uid) as { success: boolean; data?: { notifications: any[]; unreadCount: number } };
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Error loading notifications:', err);
    }
  };

  const handleMarkRead = async () => {
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
    <header className="flex-shrink-0">
      <div className="px-4 h-20 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Welcome, {userName}</h1>
          {userDesignation && (
            <p className="text-xs text-gray-600 font-medium">{userDesignation}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={handleMarkRead}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Popup */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
                <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-800">Notifications</h4>
                  <span className="text-xs text-gray-500">{notifications.length} total</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs ${n.read ? 'bg-white text-gray-600' : 'bg-blue-50 text-blue-900 font-medium'}`}>
                        <p className="font-semibold text-gray-900">{n.title}</p>
                        <p className="mt-1">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-xs text-gray-500">No new notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard/profile">
            <div className="w-9 h-9 bg-[#5e3a9e] rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-[#4a2d7e] transition">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}