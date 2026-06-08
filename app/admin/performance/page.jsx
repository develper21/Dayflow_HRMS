'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!session || session.user.role === 'EMPLOYEE') {
        return null;
    }

    return (
        <div className="min-h-screen flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                <PerformanceManagement />
            </main>
        </div>
    );
}
