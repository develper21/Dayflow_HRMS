'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/ui/notification-bell';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function AdminTimeOffPage() {
    const { data: session } = useSession();
    const [subTab, setSubTab] = useState('time-off'); // time-off | allocation
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data.leaves);
            }
        } catch (err) {
            console.error('Failed to fetch admin leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchLeaves();
        }
    }, [session]);

    const handleAction = async (id, status) => {
        try {
            const res = await fetch('/api/leaves', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, adminComment: status === 'APPROVED' ? 'Approved by HR' : 'Rejected by HR' }),
            });
            if (res.ok) {
                fetchLeaves();
            }
        } catch (err) {
            console.error('Failed to update leave status:', err);
        }
    };

    const filteredLeaves = leaves.filter(leave =>
        leave.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        leave.user?.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
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
                                <Link href="/admin/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Attendance
                                </Link>
                                <Link href="/admin/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black border-r border-black hover:bg-gray-900 transition-colors">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header & Sub Navigation */}
                <div className="mb-8">
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 px-1 uppercase tracking-[0.3em] font-mono italic">SYSTEM.ADMINISTRATION / TIME_OFF_MANAGEMENT</h2>
                    <div className="flex gap-0 border border-black w-fit bg-white">
                        <button
                            onClick={() => setSubTab('time-off')}
                            className={`text-[10px] font-black uppercase tracking-widest px-10 py-3 border-r border-black ${subTab === 'time-off' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                        >
                            Review Requests
                        </button>
                        <button
                            onClick={() => setSubTab('allocation')}
                            className={`text-[10px] font-black uppercase tracking-widest px-10 py-3 ${subTab === 'allocation' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                        >
                            Allocation Registry
                        </button>
                    </div>
                </div>

                {subTab === 'time-off' ? (
                    <>
                        {/* Sub Header Section */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="bg-red-500 text-white text-[10px] font-black px-6 py-2 border border-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_#000]">URGENT PENDINGS</div>
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="SCANNING REGISTRY BY NAME OR ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-[10px] font-black border border-black outline-none italic placeholder:text-gray-300 bg-white shadow-[2px_2px_0_0_#000] focus:shadow-none transition-all uppercase tracking-widest"
                                />
                                <svg className="w-4 h-4 text-black absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-0 border border-black mb-10 bg-white shadow-[4px_4px_0_0_#000]">
                            <div className="p-6 flex justify-between items-center border-r border-black">
                                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 italic">Global Paid leave utilization</span>
                                <span className="text-xl font-mono font-black text-black tracking-tighter">TOTAL_POOL: 1,480 DAYS</span>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-gray-50/50">
                                <span className="text-[11px] font-black uppercase tracking-widest text-red-600 italic">Active absence rate</span>
                                <span className="text-xl font-mono font-black text-black tracking-tighter">04.8% / CYCLE</span>
                            </div>
                        </div>

                        {/* Lined Grid Table */}
                        <div className="border border-black bg-white overflow-hidden shadow-[8px_8px_0_0_#000]">
                            <table className="w-full text-left text-[10px]">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="px-6 py-5 font-black uppercase tracking-widest border-r border-white/20">Identified Employee</th>
                                        <th className="px-6 py-5 font-black uppercase tracking-widest border-r border-white/20">Start Period</th>
                                        <th className="px-6 py-5 font-black uppercase tracking-widest border-r border-white/20">End Period</th>
                                        <th className="px-6 py-5 font-black uppercase tracking-widest border-r border-white/20">Leave Classification</th>
                                        <th className="px-6 py-5 font-black uppercase tracking-widest border-r border-white/20">Audit Status</th>
                                        <th className="px-6 py-5 font-black uppercase tracking-widest text-center">Executive Actions</th>
                                        <th className="w-12 bg-gray-800 border-l border-white/20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black">
                                    {loading ? (
                                        <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-400 font-mono tracking-[0.4em] animate-pulse">SYNCHRONIZING RECORDS...</td></tr>
                                    ) : filteredLeaves.length === 0 ? (
                                        <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-400 font-black italic uppercase tracking-widest">ZERO REQUESTS DETECTED IN SCAN</td></tr>
                                    ) : (
                                        filteredLeaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-5 border-r border-black font-black text-black italic bg-gray-50/30">
                                                    [{leave.user?.name}]
                                                    <p className="text-[8px] font-mono text-gray-400 mt-1 uppercase mt-1">{leave.user?.employeeId}</p>
                                                </td>
                                                <td className="px-6 py-5 border-r border-black font-mono font-bold">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                                                <td className="px-6 py-5 border-r border-black font-mono font-bold">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                                                <td className="px-6 py-5 border-r border-black text-blue-600 font-black italic uppercase tracking-tighter text-xs">{leave.type} TIME OFF</td>
                                                <td className="px-6 py-5 border-r border-black">
                                                    <div className={`inline-flex px-3 py-1 border border-black font-black uppercase text-[8px] tracking-[0.2em] ${leave.status === 'APPROVED' ? 'bg-green-500 text-white' :
                                                            leave.status === 'REJECTED' ? 'bg-red-500 text-white' :
                                                                'bg-white text-black italic'
                                                        }`}>
                                                        {leave.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {leave.status === 'PENDING' ? (
                                                        <div className="flex justify-center gap-4">
                                                            <button
                                                                onClick={() => handleAction(leave.id, 'REJECTED')}
                                                                className="w-10 h-10 bg-white border border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                                                title="Reject/Discard"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(leave.id, 'APPROVED')}
                                                                className="w-10 h-10 bg-black text-white border border-black flex items-center justify-center hover:bg-green-500 transition-all shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                                                title="Authorize Approval"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center font-black italic text-gray-400 uppercase tracking-widest text-[9px]">FINALIZED</div>
                                                    )}
                                                </td>
                                                <td className="bg-gray-100 w-12 border-l border-black"></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-sm p-12 min-h-[400px] flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl shadow-inner">📄</div>
                        <h3 className="text-sm font-bold text-gray-400 italic uppercase tracking-widest">Allocation Management</h3>
                        <p className="text-xs text-gray-400 max-w-sm text-center leading-relaxed">Admin panel for reviewing and assigning annual leave allocations to employees. No active allocations require attention.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
