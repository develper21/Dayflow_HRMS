'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { AttendanceStatusDot } from '@/components/ui/attendance-status-dot';
import { SalaryCalculator } from '@/components/admin/salary-calculator';
import { NotificationBell } from '@/components/ui/notification-bell';

export default function EmployeeDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('resume');

    useEffect(() => {
        const fetchData = async () => {
            const resolvedParams = await params;
            if (resolvedParams.id) {
                fetchEmployee(resolvedParams.id);
            }
        };
        fetchData();
    }, [params]);

    const fetchEmployee = async (id) => {
        try {
            const response = await fetch(`/api/admin/employees/${id}`);
            const data = await response.json();
            setEmployee(data.employee);
        } catch (error) {
            console.error('Failed to fetch employee:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading employee details...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Employee not found.</p>
            </div>
        );
    }

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Lined Top Navigation */}
            <nav className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4">
                                <Link href="/admin">
                                    <div className="w-12 h-12 border border-black flex items-center justify-center overflow-hidden bg-white font-black text-xs uppercase cursor-pointer">
                                        {session?.user?.companyLogo ? (
                                            <img src={session.user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-black font-black italic">LOGO</span>
                                        )}
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
                                <Link href="/admin" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black hover:bg-gray-900 transition-colors">
                                    Employees
                                </Link>
                                <Link href="/admin/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-10">
                    <button
                        onClick={() => router.back()}
                        className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-6 py-2 shadow-[2px_2px_0_0_#000] hover:shadow-none transition-all mb-8 flex items-center gap-3 bg-white"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        [ BACK_TO_WORKFORCE_REGISTRY ]
                    </button>

                    <div className="relative border-4 border-black bg-white shadow-[12px_12px_0_0_#000] p-10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 border-l-2 border-b-2 border-black bg-gray-50 text-[8px] font-black font-mono uppercase tracking-[0.3em]">
                            SUBJECT_ID: {employee.employeeId}
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
                            {/* Profile Image with Industrial Frame */}
                            <div className="relative">
                                <div className="w-40 h-40 border-[3px] border-black overflow-hidden shadow-[8px_8px_0_0_#0064ff] bg-gray-100">
                                    {employee.profile?.profilePicture ? (
                                        <img src={employee.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300 italic">
                                            {employee.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white shadow-[2px_2px_0_0_#000] cursor-pointer hover:bg-blue-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-[0.5em] font-mono">ACTIVE_ENTITY_PROFILE</h2>
                                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter italic leading-none">{employee.name}</h1>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl pt-4">
                                    {[
                                        { label: 'FUNCTIONAL_ROLE', value: employee.jobDetails?.jobPosition || 'N/A' },
                                        { label: 'ASSIGNED_UNIT', value: employee.jobDetails?.department || 'N/A' },
                                        { label: 'NETWORK_EMAIL', value: employee.email },
                                        { label: 'SUPERVISOR', value: employee.jobDetails?.manager || 'UNDEFINED' }
                                    ].map((info, idx) => (
                                        <div key={idx} className="border-l-2 border-black pl-4">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1">{info.label}</p>
                                            <p className="text-xs font-black text-black uppercase">{info.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex flex-col items-center gap-3">
                                <div className={`px-6 py-3 border-2 border-black text-center shadow-[4px_4px_0_0_#000] ${employee.attendance?.some(a => new Date(a.date).toDateString() === new Date().toDateString())
                                    ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">REAL_TIME_STATE</p>
                                    <p className="text-lg font-black italic uppercase italic">
                                        {employee.attendance?.some(a => new Date(a.date).toDateString() === new Date().toDateString()) ? 'AUTHENTICATED' : 'DISCONNECTED'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white border border-black mb-10 shadow-[6px_6px_0_0_#000] overflow-hidden">
                    {[
                        { id: 'resume', label: 'EXPERIENCE_DOSSIER', color: 'bg-blue-600' },
                        { id: 'private', label: 'CONFIDENTIAL_DATA', color: 'bg-red-600' },
                        ...(isAdmin ? [{ id: 'salary', label: 'FINANCIAL_NODES', color: 'bg-green-600' }] : [])
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-r last:border-r-0 border-black ${activeTab === tab.id
                                ? `text-white ${tab.color} italic shadow-inner`
                                : 'text-black hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {/* Resume Tab */}
                    {activeTab === 'resume' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-10">
                                {[
                                    { title: 'ABOUT_ENTITY [META]', content: employee.profile?.about },
                                    { title: 'CORE_MOTIVATIONS [SENTIMENT]', content: employee.profile?.jobLoves },
                                    { title: 'EXTRACURRICULAR_INTERESTS [UNSTRUCTURED]', content: employee.profile?.interestsHobbies }
                                ].map((section, idx) => (
                                    <div key={idx} className="border border-black bg-white p-8 shadow-[6px_6px_0_0_#000]">
                                        <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-4 font-mono italic underline">{section.title}</h3>
                                        <p className="text-xs font-mono font-bold leading-relaxed text-gray-500 italic">
                                            {section.content || 'DATA_NOT_PROVIDED: LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING AND TYPESETTING INDUSTRY. PROTOCOL INITIALIZED.'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-10">
                                {[
                                    { title: 'SKILL_SET_MATRIX', skills: ['REACT.JS', 'NEXT.JS', 'PRISMA', 'POSTGRESQL'] },
                                    { title: 'CERTIFICATION_VALIDATIONS', skills: ['AWS_CERTIFIED_v2', 'SCRUM_MASTER_PROTO'] }
                                ].map((section, idx) => (
                                    <div key={idx} className="border border-black bg-white p-8 shadow-[6px_6px_0_0_#0064ff]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">{section.title}</h3>
                                            <button className="text-[8px] font-black text-blue-600 hover:underline uppercase tracking-widest">[+ ADD_NODE]</button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {section.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest italic border border-black shadow-[2px_2px_0_0_#0064ff]">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Private Info Tab */}
                    {activeTab === 'private' && (
                        <div className="border border-black bg-white shadow-[10px_10px_0_0_#ef4444] overflow-hidden">
                            <div className="bg-black text-white px-8 py-4 flex justify-between items-center italic">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">ENCRYPTED_DATABASE_RECORD // CONFIDENTIAL</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <p className="text-[7px] font-mono font-black uppercase">SECURE_CHANNEL_v4</p>
                                </div>
                            </div>
                            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { label: 'CHRONO:DOB', value: employee.profile?.dateOfBirth ? new Date(employee.profile.dateOfBirth).toLocaleDateString() : 'N/A' },
                                    { label: 'IDENTITY:GENDER', value: employee.profile?.gender },
                                    { label: 'SOCIAL:STATUS', value: employee.profile?.maritalStatus },
                                    { label: 'GEO:NATIONALITY', value: employee.profile?.nationality },
                                    { label: 'FINANCE:BANK', value: employee.profile?.bankName },
                                    { label: 'FINANCE:ACCOUNT', value: employee.profile?.accountNumber },
                                    { label: 'FINANCE:IFSC', value: employee.profile?.ifscCode },
                                    { label: 'FINANCE:PAN', value: employee.profile?.panNumber },
                                    { label: 'RESIDENCE_IDENTIFIER', value: employee.profile?.residingAddress, fullWidth: true }
                                ].map((field, idx) => (
                                    <div key={idx} className={`${field.fullWidth ? 'md:col-span-3' : ''} border-b border-black/10 pb-4`}>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">{field.label}</p>
                                        <p className="text-sm font-mono font-black text-black uppercase italic tracking-tight">{field.value || 'UNSPECIFIED'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Salary Info Tab - ADMIN ONLY */}
                    {activeTab === 'salary' && isAdmin && (
                        <SalaryCalculator
                            employeeId={employee.id}
                            initialSalary={employee.salaryStructure}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
