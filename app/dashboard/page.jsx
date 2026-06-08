'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';

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
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
                {processing ? 'EXITING...' : 'FORCE CHECK OUT'}
            </button>
        );
    }

    return (
        <button
            onClick={() => handleAttendance('checkin')}
            disabled={processing}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
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
    const [stats, setStats] = useState({
        attendanceRate: 0,
        leaveBalance: 0,
        pendingTasks: 0,
        upcomingDeadlines: 0
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchEmployeeData();
            fetchDashboardStats();
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

    const fetchDashboardStats = async () => {
        try {
            // Fetch attendance stats
            const attendanceRes = await fetch('/api/attendance');
            const attendanceData = await attendanceRes.json();
            
            // Fetch leaves
            const leavesRes = await fetch('/api/leaves');
            const leavesData = await leavesRes.json();
            
            const approvedLeaves = leavesData.leaves?.filter(l => l.status === 'APPROVED' && l.type === 'PAID') || [];
            const leaveBalance = Math.max(0, 24 - approvedLeaves.reduce((acc, curr) => acc + (curr.days || 0), 0));
            
            setStats({
                attendanceRate: attendanceData.attendance?.length || 0,
                leaveBalance,
                pendingTasks: 0,
                upcomingDeadlines: 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
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
        <div className="min-h-screen flex">
            <EmployeeSidebar />
            
            {/* Main Content */}
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                {/* Welcome Header */}
                <div className="mb-10">
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">STAFF_PORTAL / DASHBOARD_OVERVIEW</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">Welcome Back, {employee?.name?.split(' ')[0] || 'Employee'}</h1>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <AttendanceActions />
                    </div>
                </div>

                {/* Quick Stats */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">PERFORMANCE_METRICS</h2>
                <div className="grid grid-cols-4 gap-0 border border-black mb-8 bg-white shadow-[4px_4px_0_0_#000]">
                    <div className="p-6 border-r border-black">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">ATTENDANCE THIS MONTH</p>
                        <p className="text-4xl font-mono font-black text-green-500 tracking-tighter">{stats.attendanceRate}</p>
                        <p className="text-[8px] font-mono text-gray-400 mt-1">DAYS PRESENT</p>
                    </div>
                    <div className="p-6 border-r border-black bg-gray-50/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">LEAVE BALANCE</p>
                        <p className="text-4xl font-mono font-black text-blue-500 tracking-tighter">{stats.leaveBalance}</p>
                        <p className="text-[8px] font-mono text-gray-400 mt-1">PAID DAYS AVAILABLE</p>
                    </div>
                    <div className="p-6 border-r border-black">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">PENDING TASKS</p>
                        <p className="text-4xl font-mono font-black text-orange-500 tracking-tighter">{stats.pendingTasks}</p>
                        <p className="text-[8px] font-mono text-gray-400 mt-1">ACTION REQUIRED</p>
                    </div>
                    <div className="p-6 bg-gray-50/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">UPCOMING DEADLINES</p>
                        <p className="text-4xl font-mono font-black text-red-500 tracking-tighter">{stats.upcomingDeadlines}</p>
                        <p className="text-[8px] font-mono text-gray-400 mt-1">THIS WEEK</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">QUICK_ACTIONS</h2>
                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] mb-8">
                    <div className="px-8 py-4 border-b border-black bg-gray-50">
                        <h2 className="text-sm font-black uppercase tracking-widest italic">QUICK_ACTIONS</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-4 gap-4">
                            <Link href="/dashboard/attendance" className="group">
                                <div className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">VIEW ATTENDANCE</p>
                                    <p className="text-[8px] font-mono text-gray-400 group-hover:text-gray-300">Check your attendance records</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/time-off" className="group">
                                <div className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">REQUEST LEAVE</p>
                                    <p className="text-[8px] font-mono text-gray-400 group-hover:text-gray-300">Apply for time off</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/payroll" className="group">
                                <div className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">VIEW PAYSLIPS</p>
                                    <p className="text-[8px] font-mono text-gray-400 group-hover:text-gray-300">Download salary statements</p>
                                </div>
                            </Link>
                            <Link href="/profile" className="group">
                                <div className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">UPDATE PROFILE</p>
                                    <p className="text-[8px] font-mono text-gray-400 group-hover:text-gray-300">Edit personal information</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity & Profile Summary */}
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">PERSONAL_SUMMARY</h2>
                <div className="grid grid-cols-2 gap-8">
                    {/* Profile Summary */}
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                        <div className="px-8 py-4 border-b border-black bg-gray-50">
                            <h2 className="text-sm font-black uppercase tracking-widest italic">PROFILE_SUMMARY</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 border-2 border-black flex items-center justify-center overflow-hidden bg-white">
                                    {employee?.profile?.profilePicture ? (
                                        <img src={employee.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-2xl font-black text-gray-400">
                                            {employee?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-lg font-black text-black uppercase">{employee?.name || 'Unknown'}</p>
                                    <p className="text-xs font-mono text-blue-600">{employee?.employeeId || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Department</span>
                                    <span className="text-xs font-bold text-black uppercase">{employee?.jobDetails?.department || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Position</span>
                                    <span className="text-xs font-bold text-black uppercase">{employee?.jobDetails?.jobPosition || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Location</span>
                                    <span className="text-xs font-bold text-gray-800 uppercase italic">{employee?.jobDetails?.workLocation || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000]">
                        <div className="px-8 py-4 border-b border-black bg-gray-50 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest italic">RECENT_NOTIFICATIONS</h2>
                            <Link href="/admin/notifications" className="text-[10px] font-black text-blue-600 hover:underline">VIEW ALL</Link>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="border-l-4 border-black pl-4 py-2">
                                    <p className="text-[10px] font-black text-black uppercase">Welcome to Dayflow</p>
                                    <p className="text-[8px] font-mono text-gray-400 mt-1">Your account has been successfully created</p>
                                </div>
                                <div className="border-l-4 border-gray-300 pl-4 py-2">
                                    <p className="text-[10px] font-black text-gray-600 uppercase">Complete Your Profile</p>
                                    <p className="text-[8px] font-mono text-gray-400 mt-1">Please fill in your personal information</p>
                                </div>
                                <div className="border-l-4 border-gray-300 pl-4 py-2">
                                    <p className="text-[10px] font-black text-gray-600 uppercase">Attendance Reminder</p>
                                    <p className="text-[8px] font-mono text-gray-400 mt-1">Don't forget to check in today</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
