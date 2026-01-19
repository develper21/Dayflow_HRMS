'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserAvatar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [attendanceStatus, setAttendanceStatus] = useState({ checkedIn: false, checkedOut: false });

    useEffect(() => {
        const fetchStatus = async () => {
            if (session?.user?.id) {
                try {
                    const res = await fetch('/api/attendance?statusOnly=true');
                    const data = await res.json();
                    setAttendanceStatus({
                        checkedIn: data.checkedIn,
                        checkedOut: data.checkedOut
                    });
                } catch (err) {
                    console.error('Failed to fetch attendance status', err);
                }
            }
        };

        fetchStatus();

        // Listen for internal updates
        window.addEventListener('attendanceUpdated', fetchStatus);

        const interval = setInterval(fetchStatus, 30000); // Check every 30 seconds

        return () => {
            clearInterval(interval);
            window.removeEventListener('attendanceUpdated', fetchStatus);
        };
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

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[1][0];
        }
        return name.substring(0, 2);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-4 bg-white border-2 border-black p-1 transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 group ${isOpen ? 'translate-x-0.5 translate-y-0.5 shadow-none' : ''}`}
            >
                <div className="relative">
                    <div className="w-9 h-9 border-2 border-black bg-black flex items-center justify-center text-white font-black text-sm italic">
                        {getInitials(session?.user?.name || 'User')}
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-black shadow-sm ${attendanceStatus.checkedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="text-left hidden lg:block pr-2">
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black text-black uppercase italic leading-none">{session?.user?.name}</p>
                    </div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest font-mono mt-1 leading-none">{session?.user?.role}</p>
                </div>
                <div className="hidden lg:block border-l border-gray-200 h-6 mx-1"></div>
                <svg
                    className={`w-3 h-3 text-black transition-transform mr-2 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>


            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white border-[3px] border-black shadow-[12px_12px_0_0_#000] py-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-5 py-4 border-b-2 border-black bg-gray-50">
                        <p className="text-[11px] font-black text-black uppercase italic">{session?.user?.name}</p>
                        <p className="text-[9px] font-black text-gray-400 font-mono tracking-tighter truncate mt-1">{session?.user?.email}</p>
                        <div className="inline-block px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest mt-2 font-mono italic">
                            {session?.user?.role === 'ADMIN' ? 'SUPERUSER' : 'TERMINAL_USER'}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href={session?.user?.role === 'ADMIN' ? '/admin/profile' : '/dashboard'}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-black hover:text-white transition-all font-mono"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            MY_PROFILE
                        </Link>

                        {session?.user?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-black hover:text-white transition-all font-mono"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                MANAGE_ACCESS
                            </Link>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/login' })}
                            className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all font-mono w-full text-left"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            TERMINATE_SESSION
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
