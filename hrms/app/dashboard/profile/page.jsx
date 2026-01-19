'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProfileHeader } from '@/components/employee/profile-header';
import { ProfileTabs } from '@/components/employee/profile-tabs';
import { PersonalInfoForm } from '@/components/employee/personal-info-form';
import { SalaryInfoDisplay } from '@/components/employee/salary-info-display';

export default function EmployeeProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');

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

    const handleCheckIn = async () => {
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkin' }),
            });

            if (response.ok) {
                fetchEmployeeData();
            }
        } catch (error) {
            console.error('Check in error:', error);
        }
    };

    const handleCheckOut = async () => {
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkout' }),
            });

            if (response.ok) {
                fetchEmployeeData();
            }
        } catch (error) {
            console.error('Check out error:', error);
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
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-primary-600">Dayflow</h1>
                            <div className="flex gap-6">
                                <Link href="/dashboard/profile" className="text-gray-900 font-medium border-b-2 border-primary-600 pb-1">
                                    My Profile
                                </Link>
                                <Link href="/dashboard/attendance" className="text-gray-600 hover:text-gray-900">
                                    Attendance
                                </Link>
                                <Link href="/dashboard/time-off" className="text-gray-600 hover:text-gray-900">
                                    Time Off
                                </Link>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/login' })}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                            title="Sign Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto">
                <div className="bg-white shadow-sm">
                    {/* Profile Header */}
                    <ProfileHeader
                        employee={employee}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                        canCheckInOut={true}
                    />

                    {/* Tabs */}
                    <ProfileTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        showSalary={false}
                    />

                    {/* Tab Content */}
                    <div className="bg-gray-50">
                        {activeTab === 'personal' && (
                            <PersonalInfoForm employee={employee} isEditable={false} />
                        )}
                        {activeTab === 'salary' && (
                            <SalaryInfoDisplay
                                salaryInfo={employee.salaryInfo}
                                monthlyWage={employee.salaryInfo?.monthlyWage}
                            />
                        )}
                        {activeTab === 'security' && (
                            <div className="p-6">
                                <p className="text-gray-600">Security settings coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
