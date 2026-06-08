'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
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

    // Re-fetch when user navigates away from notifications page
    useEffect(() => {
        if (!pathname.includes('notifications')) {
            fetchNotifications();
        }
    }, [pathname]);

    const notificationPath = session?.user?.role === 'ADMIN' ? '/admin/notifications' : '/dashboard/notifications';

    return (
        <Link
            href={notificationPath}
            className="w-10 h-10 flex items-center justify-center transition-all bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 relative group"
        >
            <Bell className={`w-5 h-5 transition-colors text-gray-400 group-hover:text-black`} />
            {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 border-2 border-black bg-white group-hover:animate-bounce shadow-[2px_2px_0_0_#000]">
                    <span className="relative flex rounded-none h-full w-full bg-red-600 text-[9px] text-white font-black items-center justify-center font-mono">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                </span>
            )}
        </Link>
    );
}
