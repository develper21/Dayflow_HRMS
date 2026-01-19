'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';

const NotificationIcon = ({ type }) => {
  const icons = {
    'LEAVE_PENDING': <AlertCircle className="w-5 h-5 text-yellow-500" />,
    'LEAVE_APPROVED': <CheckCircle className="w-5 h-5 text-green-500" />,
    'LEAVE_REJECTED': <X className="w-5 h-5 text-red-500" />,
    'PAYROLL_GENERATED': <CheckCircle className="w-5 h-5 text-green-500" />,
    'PERFORMANCE_REVIEW': <Info className="w-5 h-5 text-blue-500" />,
    'TRAINING_UPDATE': <Info className="w-5 h-5 text-purple-500" />,
    'SYSTEM': <Info className="w-5 h-5 text-gray-500" />
  };

  return icons[type] || <Info className="w-5 h-5 text-gray-500" />;
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    'LOW': 'bg-gray-100 text-gray-800',
    'NORMAL': 'bg-blue-100 text-blue-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'URGENT': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || colors.NORMAL}`}>
      {priority}
    </span>
  );
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId })
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <PriorityBadge priority={notification.priority} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                {notification.actionText} →
                              </span>
                            )}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
