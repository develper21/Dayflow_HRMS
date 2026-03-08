'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/ui/notification-bell';

export default function EmployeeAttendancePage() {
    const { data: session } = useSession();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, leaves: 0, total: 30 });
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        if (session) {
            fetchAttendance();
        }
    }, [session, month]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance?month=${month}`);
            if (res.ok) {
                const data = await res.json();
                setAttendance(data.attendance);
                setStats(data.summary || { present: data.attendance.length, leaves: 0, total: 30 });
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Lined Top Navigation */}
            <nav className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center overflow-hidden bg-white font-black text-xs uppercase cursor-pointer">
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
                                        {session?.user?.companyName || 'STAFF PORTAL'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex border border-black bg-white overflow-hidden shadow-[2px_2px_0_0_#000]">
                                <Link href="/dashboard" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black border-r border-black hover:bg-gray-900 transition-colors">
                                    Attendance
                                </Link>
                                <Link href="/dashboard/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Time Off
                                </Link>
                                <Link href="/dashboard/payroll" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-100 transition-colors">
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
                <div className="grid grid-cols-3 gap-0 border border-black mb-10 bg-white shadow-[4px_4px_0_0_#000]">
                    <div className="p-8 border-r border-black">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 italic">CYCLE_PRESENCE</p>
                        <p className="text-4xl font-mono font-black text-green-500 tracking-tighter">{stats.present.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="p-8 border-r border-black bg-gray-50/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 italic">DETECTED_ABSENCES</p>
                        <p className="text-4xl font-mono font-black text-red-500 tracking-tighter">{stats.leaves.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 italic">MONTH_EXPECTANCY</p>
                        <p className="text-4xl font-mono font-black text-black tracking-tighter">{stats.total.toString().padStart(2, '0')}</p>
                    </div>
                </div>

                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                    <div className="px-8 py-5 border-b border-black bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] font-mono italic">CHRONOLOGICAL_ATTENDANCE_LOG</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase">FILTRATION</span>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="bg-white border border-black px-4 py-2 text-[10px] font-black uppercase outline-none shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all cursor-pointer"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' }).toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto text-[10px]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black text-white shrink-0">
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">Execution Date</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">Inward Entry</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">Outward Entry</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-center">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-mono tracking-[0.5em] animate-pulse">EXTRACTING METADATA...</td></tr>
                                ) : attendance.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic font-black uppercase tracking-widest">ERROR: NO RECORDS DETECTED IN STORAGE</td></tr>
                                ) : (
                                    attendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-5 border-r border-black font-black text-gray-600 uppercase">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="px-8 py-5 border-r border-black font-mono font-bold text-blue-600 italic">
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 border-r border-black font-mono font-bold text-red-600 italic">
                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className={`inline-flex px-3 py-1 border border-black font-black uppercase text-[8px] tracking-[0.2em] ${record.status === 'PRESENT' ? 'bg-green-500 text-white' :
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
