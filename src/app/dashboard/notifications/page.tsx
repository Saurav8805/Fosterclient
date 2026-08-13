'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (!id) {
      router.push('/login');
      return;
    }
    setUserId(id);
    fetchNotifications(id);
  }, []);

  const fetchNotifications = async (uId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.list(uId);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Fetch notifications error:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await notificationsApi.readAll(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-rose-500 text-white font-bold text-xs rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Real-time alerts, scheduled event notifications, and school updates</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-purple-50 text-[#5e3a9e] border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition"
            >
              ✓ Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
              <p className="text-xs text-gray-500">Fetching notifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 text-sm font-medium">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-16 h-16 bg-purple-50 text-[#5e3a9e] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                🔔
              </div>
              <p className="text-base font-semibold text-gray-700">No Notifications Yet</p>
              <p className="text-xs text-gray-400 mt-1">You're all caught up! Updates and scheduled events will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                    !item.read
                      ? 'bg-purple-50/60 border-purple-200 shadow-xs'
                      : 'bg-gray-50/50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                      !item.read ? 'bg-[#5e3a9e] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      🔔
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.title}
                      </h4>
                      {item.message && (
                        <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                      )}
                      <span className="text-[11px] text-gray-400 mt-2 block">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {!item.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
