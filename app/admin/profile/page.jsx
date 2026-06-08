'use client';

import { useSession, signOut } from 'next-auth/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminProfilePage() {
    const { data: session } = useSession();

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
                <div className="mb-10">
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">SYSTEM.ADMINISTRATION / OPERATOR_PROFILE</h2>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight italic">Administrator Identity</h1>
                </div>

                <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-10">
                    <div className="flex items-start gap-12 mb-12">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-40 h-40 border-[3px] border-black overflow-hidden shadow-[8px_8px_0_0_#0064ff] bg-gray-100">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300 italic">
                                        {session?.user?.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-[0.5em] font-mono">ADMINISTRATOR_ENTITY</h2>
                                <h1 className="text-5xl font-black text-black uppercase tracking-tighter italic leading-none">{session?.user?.name || 'UNKNOWN'}</h1>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl pt-4">
                                {[
                                    { label: 'NETWORK_EMAIL', value: session?.user?.email || 'N/A' },
                                    { label: 'ACCESS_LEVEL', value: session?.user?.role || 'N/A' },
                                    { label: 'ORGANIZATION', value: session?.user?.companyName || 'N/A' }
                                ].map((info, idx) => (
                                    <div key={idx} className="border-l-2 border-black pl-4">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1">{info.label}</p>
                                        <p className="text-xs font-black text-black uppercase">{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <div className="border-t-2 border-black pt-8">
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/login' })}
                            className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#ef4444] hover:shadow-none transition-all flex items-center gap-3 active:translate-x-1 active:translate-y-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            TERMINATE_SESSION
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
