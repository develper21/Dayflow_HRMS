import { AddEmployeeForm } from '@/components/admin/add-employee-form';
import Link from 'next/link';
import { NotificationBell } from '@/components/ui/notification-bell';
import { UserAvatar } from '@/components/ui/user-avatar';

export const metadata = {
    title: 'Add New Employee - Dayflow HR',
    description: 'Add a new employee to the system',
};

export default function AddEmployeePage() {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Lined Top Navigation */}
            <nav className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4">
                                <Link href="/admin">
                                    <div className="w-12 h-12 border border-black flex items-center justify-center overflow-hidden bg-white font-black text-xs uppercase cursor-pointer">
                                        <span className="text-black font-black italic">LOGO</span>
                                    </div>
                                </Link>
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
                                <Link href="/admin/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Time Off
                                </Link>
                                <Link href="/admin/payroll" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 border-l-8 border-black pl-8">
                    <h2 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">REGISTRATION_FLOW / ENTITY_CREATION</h2>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight italic">Initialize New Member</h1>
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-2">Provisioning system credentials and administrative parameters</p>
                </div>
                <AddEmployeeForm />
            </main>
        </div>
    );
}
