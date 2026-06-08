'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import ReportsManager from '@/components/ReportsManager';

export default function AdminReportsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

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
                <ReportsManager />
            </main>
        </div>
    );
}
