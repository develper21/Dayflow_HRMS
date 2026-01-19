'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/ui/notification-bell';

export default function AdminAttendancePage() {
    const { data: session } = useSession();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date: currentDate,
                search: search
            });
            const res = await fetch(`/api/attendance?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAttendance(data.attendance);
            }
        } catch (err) {
            console.error('Failed to fetch admin attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchAttendance();
        }
    }, [session, currentDate, search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Lined Top Navigation */}
            <nav className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center overflow-hidden bg-white font-black text-xs uppercase">
                                    {session?.user?.companyLogo ? (
                                        <img src={session.user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-black font-black italic">LOGO</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-black tracking-tighter uppercase leading-none">
                                        Dayflow
                                    </h1>
                                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        ADMIN CONTROL PORTAL
                                    </p>
                                </div>
                            </div>

                            <div className="flex border border-black bg-white overflow-hidden shadow-[2px_2px_0_0_#000]">
                                <Link href="/admin" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Employees
                                </Link>
                                <Link href="/admin/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black border-r border-black hover:bg-gray-900 transition-colors">
                                    Attendance
                                </Link>
                                <Link href="/admin/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Time Off
                                </Link>
                                <Link href="/admin/payroll" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-100 transition-colors">
                                    Payroll
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <UserAvatar />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                        <div className="flex items-center gap-6 flex-1">
                            <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic shrink-0">Attendance Registry</h1>
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="SCANNING BY NAME OR ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-[10px] font-black border border-black outline-none italic placeholder:text-gray-300 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none transition-all uppercase tracking-widest"
                                />
                                <svg className="w-5 h-5 text-black absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white px-4 py-3 border border-black shadow-[4px_4px_0_0_#000] w-fit">
                            <span className="text-[10px] font-black text-gray-400 uppercase italic">Date:</span>
                            <input
                                type="date"
                                value={currentDate}
                                onChange={(e) => setCurrentDate(e.target.value)}
                                className="bg-transparent outline-none text-[10px] font-black uppercase"
                            />
                        </div>
                    </div>

                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black text-white shrink-0">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Authorized Employee</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Check In Entry</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Check Out Entry</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Audit Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black text-[10px]">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-mono tracking-[0.5em] animate-pulse">POOLING DATA FROM SECURE_SERVER...</td></tr>
                                ) : attendance.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest">ZERO RECORDS DETECTED IN THIS CYCLE</td></tr>
                                ) : (
                                    attendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-5 border-r border-black">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-black italic">[{record.user?.name}]</span>
                                                    <span className="text-[8px] font-mono text-gray-400 mt-1 uppercase mt-1">{record.user?.employeeId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 border-r border-black font-mono font-bold text-blue-600 italic">
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'PENDING'}
                                            </td>
                                            <td className="px-8 py-5 border-r border-black font-mono font-bold text-red-600 italic">
                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'OPEN'}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className={`inline-flex px-3 py-1 border border-black font-black uppercase text-[8px] tracking-[0.2em] shadow-[1px_1px_0_0_#000] ${record.status === 'PRESENT' ? 'bg-green-500 text-white' :
                                                        record.status === 'LATE' ? 'bg-yellow-400 text-black' :
                                                            'bg-red-500 text-white'
                                                    }`}>
                                                    {record.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
