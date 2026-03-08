'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminProfilePage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-primary-600">Dayflow</h1>
                            <div className="flex gap-6">
                                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                                    Employees
                                </Link>
                                <Link href="/admin/profile" className="text-gray-900 font-medium border-b-2 border-primary-600 pb-1">
                                    My Profile
                                </Link>
                                <Link href="/admin/attendance" className="text-gray-600 hover:text-gray-900">
                                    Attendance
                                </Link>
                                <Link href="/admin/time-off" className="text-gray-600 hover:text-gray-900">
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
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile (HR Admin)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-lg">{session?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{session?.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="font-medium">
                                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                                        {session?.user?.role}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Company</p>
                                <p className="font-medium">{session?.user?.companyName || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
