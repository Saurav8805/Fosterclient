'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api';
import { Bell, Plus, X, Send, Users, Languages } from 'lucide-react';

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
  const [userRole, setUserRole] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [translatedNotifications, setTranslatedNotifications] = useState<Map<string, any>>(new Map());
  
  // Create notification modal state (Admin only)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    message: ''
  });

  useEffect(() => {
    const id = localStorage.getItem('userId') || localStorage.getItem('user_id');
    const role = localStorage.getItem('userRole');
    if (!id) {
      router.push('/login');
      return;
    }
    setUserId(id);
    setUserRole(Number(role));
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

  const handleTranslateNotification = async (notificationId: string) => {
    console.log('🎯 Translation button clicked for:', notificationId);
    
    // Check if already translated
    if (translatedNotifications.has(notificationId)) {
      // Toggle back to original
      const newMap = new Map(translatedNotifications);
      newMap.delete(notificationId);
      setTranslatedNotifications(newMap);
      console.log('🔄 Reverted to English, map size:', newMap.size);
      return;
    }

    // Find notification
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.error('❌ Notification not found:', notificationId);
      return;
    }

    setTranslatingIds(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });

    try {
      console.log('🌐 Translating notification:', notification.title);
      console.log('📍 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/translate/notifications`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translate/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: [{
            id: notification.id,
            title: notification.title,
            message: notification.message || ''
          }],
          targetLang: 'mr'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Full API response:', data);
      
      if (data.success && data.data?.notifications?.[0]) {
        const translatedNotif = data.data.notifications[0];
        console.log('✅ Translated title:', translatedNotif.title);
        console.log('✅ Translated message:', translatedNotif.message);
        
        // Force a new Map to trigger re-render
        setTranslatedNotifications(prev => {
          const newMap = new Map(prev);
          newMap.set(notificationId, {
            ...notification,
            title: translatedNotif.title,
            message: translatedNotif.message
          });
          console.log('💾 Updated map, size:', newMap.size);
          console.log('💾 Has this notification?', newMap.has(notificationId));
          return newMap;
        });
        
        console.log('✅ State updated successfully');
      } else {
        console.error('❌ Translation failed:', data);
        alert('Translation service unavailable');
      }
    } catch (error) {
      console.error('❌ Translation error:', error);
      alert('Failed to translate notification');
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      setCreateError('Please provide a title');
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await notificationsApi.create({ ...createForm, targetAudience: ['all'] });
      if (res.success) {
        setCreateSuccess('Notification sent to all users successfully!');
        setCreateForm({ title: '', message: '' });
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess(null);
          if (userId) fetchNotifications(userId);
        }, 1500);
      } else {
        setCreateError(res.error || 'Failed to send notification. Backend route not deployed yet.');
      }
    } catch (err: any) {
      setCreateError('Backend route not available yet. Please wait for deployment or merge dev to main branch.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const res = await notificationsApi.delete(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        alert('Failed to delete. Backend route not deployed yet.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Backend route not available yet. Please wait for deployment or merge dev to main branch.');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isAdmin = userRole === 6 || userRole === 8;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#5e3a9e]" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 bg-rose-500 text-white font-bold text-xs rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin ? 'Send announcements and view all notifications' : 'Real-time alerts, scheduled events, and school updates'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-purple-50 text-[#5e3a9e] border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition touch-manipulation"
              >
                ✓ Mark All Read
              </button>
            )}
            
            {isAdmin && (
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setCreateError(null);
                  setCreateSuccess(null);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-xs font-bold transition shadow-sm touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                New Notification
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
              <p className="text-xs text-gray-500">Fetching notifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 text-sm font-medium">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-gray-400">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 text-[#5e3a9e] rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-700">No Notifications Yet</p>
              <p className="text-xs text-gray-400 mt-1">You're all caught up! Updates and scheduled events will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(item => {
                const displayNotification = translatedNotifications.get(item.id) || item;
                const isTranslated = translatedNotifications.has(item.id);
                const isTranslating = translatingIds.has(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 rounded-xl border transition flex items-start justify-between gap-3 sm:gap-4 ${
                      !item.read
                        ? 'bg-purple-50/60 border-purple-200 shadow-xs'
                        : 'bg-gray-50/50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        !item.read ? 'bg-[#5e3a9e] text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {displayNotification.title}
                        </h4>
                        {displayNotification.message && (
                          <p className="text-xs text-gray-600 mt-1 break-words">{displayNotification.message}</p>
                        )}
                        <span className="text-[10px] sm:text-[11px] text-gray-400 mt-2 block">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 flex-shrink-0">
                      {/* Translation Button */}
                      <button
                        onClick={() => handleTranslateNotification(item.id)}
                        disabled={isTranslating}
                        className={`p-1.5 rounded-lg transition-all ${
                          isTranslated
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isTranslated ? 'Show original (English)' : 'Translate to Marathi'}
                      >
                        {isTranslating ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                      
                      {!item.read && (
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 mt-2"></span>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition touch-manipulation"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal (Admin Only) */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b bg-[#5e3a9e] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <h3 className="text-lg font-bold">Send New Notification</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="p-6 space-y-4">
              {createSuccess && (
                <div className="p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {createSuccess}
                </div>
              )}

              {createError && (
                <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                  {createError}
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Broadcast to All:</strong> This notification will be sent to all users including parents, students, and teachers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                  placeholder="e.g., School Holiday Announcement"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={createForm.message}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none resize-none"
                  placeholder="Add detailed information here..."
                  maxLength={500}
                />
                <p className="text-[10px] text-gray-400 mt-1">{createForm.message.length}/500 characters</p>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-[#5e3a9e] text-white rounded-xl hover:bg-[#4a2d7e] transition text-sm font-semibold disabled:opacity-50 shadow-sm touch-manipulation"
                >
                  {creating ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
