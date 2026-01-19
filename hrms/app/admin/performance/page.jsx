'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import NotificationCenter from '@/components/NotificationCenter';
import PerformanceManagement from '@/components/PerformanceManagement';

export default function PerformancePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
        } else if (session.user.role === 'EMPLOYEE') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session || session.user.role === 'EMPLOYEE') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="text-xl font-bold text-gray-900">
                                Dayflow HRMS
                            </Link>
                            <div className="ml-10 flex items-center space-x-4">
                                <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/admin/analytics" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Analytics
                                </Link>
                                <Link href="/admin/reports" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Reports
                                </Link>
                                <Link href="/admin/performance" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                                    Performance
                                </Link>
                                <Link href="/admin/training" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Training
                                </Link>
                                <Link href="/admin/recruitment" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Recruitment
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationCenter />
                            <UserAvatar />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <PerformanceManagement />
            </main>
        </div>
    );
}
