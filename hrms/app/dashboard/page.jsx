'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import NotificationCenter from '@/components/NotificationCenter';

function AttendanceActions() {
    const { data: session } = useSession();
    const [status, setStatus] = useState({ checkedIn: false, checkedOut: false });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/attendance?statusOnly=true');
            const data = await res.json();
            setStatus({ checkedIn: data.checkedIn, checkedOut: data.checkedOut });
        } catch (err) {
            console.error('Failed to fetch attendance status', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchStatus();
        }
    }, [session]);

    const handleAttendance = async (action) => {
        setProcessing(true);
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchStatus();
                // Optionally trigger a custom event to notify UserAvatar
                window.dispatchEvent(new Event('attendanceUpdated'));
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (err) {
            console.error('Attendance error', err);
            alert('Failed to process attendance');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="animate-pulse bg-gray-50 h-10 w-32 border border-black italic font-mono text-[10px] flex items-center justify-center">SYNCING...</div>;

    if (status.checkedOut) {
        return (
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white px-4 py-2 border border-black shadow-[2px_2px_0_0_#000]">
                TERMINATED FOR TODAY
            </div>
        );
    }

    if (status.checkedIn) {
        return (
            <button
                onClick={() => handleAttendance('checkout')}
                disabled={processing}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 border border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
            >
                {processing ? 'EXITING...' : 'FORCE CHECK OUT'}
            </button>
        );
    }

    return (
        <button
            onClick={() => handleAttendance('checkin')}
            disabled={processing}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 border border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
        >
            {processing ? 'ENTERING...' : 'INITIATE CHECK IN'}
        </button>
    );
}


export default function EmployeeDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('resume');

    useEffect(() => {
        if (session?.user?.id) {
            fetchEmployeeData();
        }
    }, [session]);

    const fetchEmployeeData = async () => {
        try {
            const response = await fetch(`/api/admin/employees/${session.user.id}`);
            const data = await response.json();
            setEmployee(data.employee);
        } catch (error) {
            console.error('Failed to fetch employee data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Employee data not found.</p>
            </div>
        );
    }

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
                                <Link href="/dashboard" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black border-r border-black hover:bg-gray-900 transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
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
                            <NotificationCenter />
                            <UserAvatar />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-black flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em]">Employee Profile</h2>
                        <AttendanceActions />
                    </div>

                    {/* Profile Section */}
                    <div className="p-10 border-b border-black">
                        <div className="flex items-start gap-12">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-40 h-40 border-2 border-black bg-white flex items-center justify-center overflow-hidden">
                                    {employee.profile?.profilePicture ? (
                                        <img src={employee.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                            <svg className="w-20 h-20 text-black opacity-20" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-black border border-white flex items-center justify-center text-white hover:bg-gray-900 transition-all shadow-lg active:scale-95">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Employee Info Grid */}
                            <div className="flex-1 grid grid-cols-2 gap-x-16 gap-y-8">
                                <div className="space-y-6">
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</h3>
                                        <p className="text-xl font-bold text-black uppercase">{employee.name}</p>
                                    </div>
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Employee ID</h3>
                                        <p className="text-lg font-mono font-bold text-blue-600">{employee.employeeId}</p>
                                    </div>
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Official Email</h3>
                                        <p className="text-md font-bold text-gray-800">{employee.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Department</h3>
                                        <p className="text-lg font-bold text-black uppercase">{employee.jobDetails?.department || 'STREET OPS'}</p>
                                    </div>
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Role / Position</h3>
                                        <p className="text-lg font-bold text-black uppercase">{employee.jobDetails?.jobPosition || 'FIELD AGENT'}</p>
                                    </div>
                                    <div className="border-l-4 border-black pl-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Work Location</h3>
                                        <p className="text-md font-bold text-gray-800 uppercase italic">Mumbai HQ - {employee.jobDetails?.workLocation || 'REMOTE'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-black bg-gray-50">
                        <div className="flex gap-0 px-8">
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={`px-10 py-4 font-black uppercase tracking-widest text-[10px] border-x border-black transition-all ${activeTab === 'resume'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                PROFILE DATA
                            </button>
                            <button
                                onClick={() => setActiveTab('private')}
                                className={`px-10 py-4 font-black uppercase tracking-widest text-[10px] border-r border-black transition-all ${activeTab === 'private'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                BANK & KYC
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`px-10 py-4 font-black uppercase tracking-widest text-[10px] border-r border-black transition-all ${activeTab === 'security'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                SYSTEM ACCESS
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Resume Tab */}
                        {activeTab === 'resume' && (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-600">Resume information coming soon...</p>
                            </div>
                        )}

                        {/* Bank Details Content - MATCHING MOCKUP */}
                        {activeTab === 'private' && (
                            <div className="grid grid-cols-2 border border-black divide-x divide-black bg-white shadow-[4px_4px_0_0_#000]">
                                <div className="p-8 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 mb-4 italic">Identity Verification</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">Nationality</label>
                                            <p className="font-bold border-b border-gray-200 pb-1">{employee.profile?.nationality || 'INDIAN'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">Gender</label>
                                            <p className="font-bold border-b border-gray-200 pb-1 font-mono italic">{employee.profile?.gender || 'NOT SPECIFIED'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">Physical Address</label>
                                        <p className="font-bold border-b border-gray-200 pb-1 italic text-blue-600">{employee.profile?.residingAddress || 'ADDRESS VERIFICATION PENDING'}</p>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6 bg-gray-50/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-black pb-2 mb-4 italic">Financial & Bank Records</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-red-400 tracking-tighter uppercase">Permanent Account (PAN)</label>
                                            <p className="font-mono font-bold border-b border-gray-200 pb-1">{employee.profile?.panNumber || 'REQUIRED'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-green-400 tracking-tighter uppercase">UAN Number</label>
                                            <p className="font-mono font-bold border-b border-gray-200 pb-1">{employee.profile?.uanNumber || 'REQUIRED'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-black p-4 mt-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-black uppercase">Bank Account</p>
                                            <p className="text-[8px] font-mono text-gray-400">ENCRYPTED</p>
                                        </div>
                                        <p className="text-lg font-black tracking-widest font-mono italic">{employee.profile?.accountNumber || 'XXXX XXXX XXXX'}</p>
                                        <p className="text-xs font-bold text-gray-600 mt-2 uppercase">{employee.profile?.bankName || 'AWAITING DETAILS'} - {employee.profile?.ifscCode || 'IFSC'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-600">Security settings coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
