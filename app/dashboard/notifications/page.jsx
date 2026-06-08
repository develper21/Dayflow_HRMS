'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function EmployeeNotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
        } else if (session.user.role === 'ADMIN') {
            router.push('/admin/notifications');
        }
    }, [session, status, router]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            });
            if (res.ok) {
                setNotifications(notifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const res = await fetch(`/api/notifications?notificationId=${notificationId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setNotifications(notifications.filter(n => n.id !== notificationId));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session || session.user.role === 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen flex">
            <EmployeeSidebar />
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">STAFF_PORTAL / NOTIFICATION_CENTER</h2>
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">Notifications</h1>
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">View and manage your notifications</p>
                </div>

                <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
                    <div className="px-8 py-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-4">
                            <Bell className="w-6 h-6 text-black" />
                            <span className="text-[10px] font-black text-black uppercase tracking-widest font-mono">
                                {notifications.filter(n => !n.isRead).length} UNREAD
                            </span>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                        >
                            <Check className="w-4 h-4" />
                            <span>MARK_ALL_READ</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600 font-mono font-black uppercase tracking-widest">LOADING_NOTIFICATIONS...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-20 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-300 font-black uppercase tracking-[0.2em] italic text-[10px] font-mono">
                                // NO_NOTIFICATIONS_FOUND
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-black">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors relative overflow-hidden ${!notification.isRead ? 'bg-blue-50/20' : ''}`}
                                >
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                                    )}
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <span className={`text-[10px] font-black uppercase italic ${!notification.isRead ? 'text-black' : 'text-gray-500'}`}>
                                                    {notification.title}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-black font-mono uppercase tracking-wider mb-3">
                                                {notification.message}
                                            </p>
                                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
