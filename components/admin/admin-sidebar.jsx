'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/ui/notification-bell';
import { Users, Clock, Shield, DollarSign, BarChart, LineChart, Target, BookOpen } from 'lucide-react';

const navigationItems = [
    { name: 'Employees', href: '/admin', icon: Users },
    { name: 'Attendance', href: '/admin/attendance', icon: Clock },
    { name: 'Time Off', href: '/admin/time-off', icon: Shield },
    { name: 'Payroll', href: '/admin/payroll', icon: DollarSign },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
    { name: 'Analytics', href: '/admin/analytics', icon: LineChart },
    { name: 'Performance', href: '/admin/performance', icon: Target },
    { name: 'Training', href: '/admin/training', icon: BookOpen },
];

export function AdminSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r-2 border-black flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-6 border-b-2 border-black">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-black flex items-center justify-center overflow-hidden bg-white">
                        <img src="./favicon.svg" alt="Dayflow" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-black tracking-tighter uppercase leading-none">
                            Dayflow
                        </h1>
                        <p className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                            ADMIN PORTAL
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isActive
                                            ? 'bg-black text-white shadow-[2px_2px_0_0_#000]'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Profile Section */}
            <div className="p-4 border-t-2 border-black bg-gray-50">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 p-3 border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:shadow-none transition-all flex-1"
                    >
                        <div className="w-10 h-10 border-2 border-black overflow-hidden bg-gray-200">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-black text-gray-400">
                                    {session?.user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-black uppercase truncate">{session?.user?.name || 'Unknown'}</p>
                            <p className="text-[8px] font-mono text-gray-500 uppercase truncate">{session?.user?.role || 'N/A'}</p>
                        </div>
                    </Link>
                    <NotificationBell />
                </div>
            </div>
        </div>
    );
}
