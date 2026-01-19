'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({}) });
            if (res.ok) {
                setUnreadCount(0);
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center transition-all bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 relative group ${isOpen ? 'bg-primary-50 translate-x-0.5 translate-y-0.5 shadow-none' : ''}`}
            >
                <svg className={`w-5 h-5 transition-colors ${isOpen ? 'text-black' : 'text-gray-400 group-hover:text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 border-2 border-black bg-white group-hover:animate-bounce shadow-[2px_2px_0_0_#000]">
                        <span className="relative flex rounded-none h-full w-full bg-red-600 text-[9px] text-white font-black items-center justify-center font-mono">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white border-[3px] border-black shadow-[12px_12px_0_0_#000] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-4 bg-black"></div>
                            <h3 className="text-[10px] font-black text-black uppercase tracking-widest font-mono italic">NOTIFICATIONS</h3>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="text-[9px] text-blue-600 hover:text-black font-black uppercase tracking-widest font-mono underline underline-offset-2"
                        >
                            CLEAR_ALL
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-gray-300 font-black uppercase tracking-[0.2em] italic text-[10px] font-mono">
                                // NO_ACTIVE_ALERTS
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default relative overflow-hidden group ${!n.isRead ? 'bg-primary-50/20' : ''}`}
                                >
                                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[11px] font-black uppercase italic ${!n.isRead ? 'text-black' : 'text-gray-500'}`}>{n.title}</span>
                                        <span className="text-[9px] font-black text-gray-300 font-mono">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 leading-tight font-medium">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
