'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NotificationBell } from '@/components/ui/notification-bell';

function AttendanceStatusBadge() {
    const { data: session } = useSession();
    const [status, setStatus] = useState({ checkedIn: false, checkedOut: false });

    const fetchStatus = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch('/api/attendance?statusOnly=true');
            if (res.ok) {
                const data = await res.json();
                setStatus({ checkedIn: data.checkedIn, checkedOut: data.checkedOut });
            }
        } catch (err) {
            console.error('Badge status error:', err);
        }
    };

    useEffect(() => {
        fetchStatus();
        window.addEventListener('attendanceUpdated', fetchStatus);
        const interval = setInterval(fetchStatus, 30000);
        return () => {
            window.removeEventListener('attendanceUpdated', fetchStatus);
            clearInterval(interval);
        };
    }, [session]);

    if (status.checkedIn) {
        return (
            <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-sm"></span>
            </div>
        );
    }

    return (
        <div className="relative flex h-4 w-4">
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-sm"></span>
        </div>
    );
}


const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', adminOnly: false },
    { name: 'Attendance', href: '/dashboard/attendance', icon: '⏰', adminOnly: false },
    { name: 'Time Off', href: '/dashboard/time-off', icon: '🏖️', adminOnly: false },
    { name: 'Profile', href: '/profile', icon: '👤', adminOnly: false },
];

const adminNavigationItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊', adminOnly: true },
    { name: 'Employees', href: '/admin/employees', icon: '👥', adminOnly: true },
    { name: 'Attendance', href: '/admin/attendance', icon: '⏰', adminOnly: true },
    { name: 'Time Off', href: '/admin/time-off', icon: '🛡️', adminOnly: true },
    { name: 'Profile', href: '/admin/profile', icon: '👤', adminOnly: true },
];

export function DashboardLayout({ children, companyName, companyLogo }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const isAdmin = session?.user?.role === 'ADMIN';
    const navItems = isAdmin ? adminNavigationItems : navigationItems;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileDropdownOpen]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
            >
                {/* Company Logo & Name */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    {companyLogo && (
                        <img
                            src={companyLogo}
                            alt={companyName || 'Company'}
                            className="w-10 h-10 object-contain"
                        />
                    )}
                    {isSidebarOpen && (
                        <h1 className="text-xl font-bold text-primary-600 truncate">
                            {companyName || 'Dayflow'}
                        </h1>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {isSidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-4 border-t border-gray-200 text-gray-500 hover:text-gray-700"
                >
                    {isSidebarOpen ? '◀' : '▶'}
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {navItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + '/'))?.name || 'Dashboard'}
                            </h2>
                        </div>

                        {/* Notifications & User Profile */}
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    <div className="relative group">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                                            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="absolute -top-1 -right-1 flex items-center justify-center">
                                            {!isAdmin && <AttendanceStatusBadge />}
                                        </div>
                                    </div>
                                    {isSidebarOpen && (
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-bold text-gray-900 leading-tight">
                                                {session?.user?.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                                                {session?.user?.role}
                                            </span>
                                        </div>
                                    )}
                                </button>
                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <Link
                                            href={isAdmin ? '/admin/profile' : '/profile'}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: '/auth/login' });
                                                setIsProfileDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}

