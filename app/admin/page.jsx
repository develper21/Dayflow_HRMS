'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeCard } from '@/components/admin/employee-card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/ui/notification-bell';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        absentToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDashboardData = async () => {
        try {
            const [empRes, statsRes] = await Promise.all([
                fetch('/api/admin/employees'),
                fetch('/api/admin/dashboard')
            ]);

            const empData = await empRes.json();
            const statsData = await statsRes.json();

            setEmployees(empData.employees || []);
            setStats(statsData.stats || {
                totalEmployees: 0,
                presentToday: 0,
                onLeave: 0,
                absentToday: 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchDashboardData();
    }, [session]);

    const filteredEmployees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobDetails?.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <Link href="/admin" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black hover:bg-gray-900 transition-colors">
                                    Employees
                                </Link>
                                <Link href="/admin/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Attendance
                                </Link>
                                <Link href="/admin/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Time Off
                                </Link>
                                <Link href="/admin/payroll" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Payroll
                                </Link>
                                <Link href="/admin/reports" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-100 transition-colors">
                                    Reports
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Stats */}
                <div className="mb-10">
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">HUB_CONTROL / WORKFORCE_OVERVIEW</h2>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div>
                            <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">Employee Management</h1>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Authorized Oversight and Administrative Operations</p>
                        </div>
                        <Link href="/admin/employees/new">
                            <button className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all flex items-center gap-3 active:translate-x-1 active:translate-y-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
                                </svg>
                                REGISTER_NEW_ENTITY
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid - MATCHING ATTENDANCE STYLE */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'TOTAL_RECORDS', value: stats.totalEmployees, color: 'text-black' },
                        { label: 'STATUS:PRESENT', value: stats.presentToday, color: 'text-green-600' },
                        { label: 'STATUS:ON_LEAVE', value: stats.onLeave, color: 'text-blue-500' },
                        { label: 'STATUS:ABSENT', value: stats.absentToday, color: 'text-red-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="border border-black p-6 bg-white shadow-[4px_4px_0_0_#000]">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 font-mono">[{stat.label}]</p>
                            <p className={`text-3xl font-black italic font-mono ${stat.color}`}>{String(stat.value).padStart(2, '0')}</p>
                            <div className="h-0.5 w-8 bg-black mt-4"></div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-2xl">
                    <input
                        type="text"
                        placeholder="SCANNING BY NAME, ID, OR DEPARTMENT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-[10px] font-black border border-black outline-none italic placeholder:text-gray-300 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none transition-all uppercase tracking-widest"
                    />
                    <svg className="w-6 h-6 text-black absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Employee Lined Table Layout */}
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden mb-20">
                    <table className="w-full text-left text-[10px]">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 italic">ENTITY_NAME</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">SYSTEM_ID</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">DEPARTMENT</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">POSITION</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-center italic">REAL_TIME_STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black font-mono">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-24 text-center text-gray-400 font-mono tracking-[0.5em] animate-pulse">EXTRACTING_WORKFORCE_DATA...</td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-24 text-center text-gray-400 italic font-black uppercase tracking-widest">ERROR: NO_MATCHING_RECORDS</td></tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/employees/${emp.id}`)}>
                                        <td className="px-8 py-5 border-r border-black font-black text-black italic bg-gray-100/20 group-hover:bg-blue-50/50">{emp.name}</td>
                                        <td className="px-8 py-5 border-r border-black font-bold text-gray-400 group-hover:text-black">{emp.employeeId || 'UNDEFINED'}</td>
                                        <td className="px-8 py-5 border-r border-black uppercase text-gray-500">{emp.jobDetails?.department || 'N/A'}</td>
                                        <td className="px-8 py-5 border-r border-black uppercase font-black tracking-widest">{emp.jobDetails?.jobPosition || 'N/A'}</td>
                                        <td className="px-8 py-5 text-center">
                                            <div className={`inline-block px-3 py-1 border border-black text-[8px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0_0_#000] ${emp.attendance?.some(a => new Date(a.date).toDateString() === new Date().toDateString())
                                                ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                {emp.attendance?.some(a => new Date(a.date).toDateString() === new Date().toDateString()) ? 'AUTHENTICATED:ACTIVE' : 'SIGNAL_LOST:AWAY'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
