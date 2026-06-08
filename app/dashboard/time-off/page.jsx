'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';

export default function EmployeeTimeOffPage() {
    const { data: session } = useSession();
    const [subTab, setSubTab] = useState('time-off'); // time-off | allocation
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [formData, setFormData] = useState({
        type: 'PAID',
        startDate: '',
        endDate: '',
        reason: '',
        days: 1
    });

    const [availableLeave, setAvailableLeave] = useState({ paid: 24, sick: 7 });

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data.leaves);

                // Real-time calculation
                const approvedPaid = data.leaves
                    .filter(l => l.status === 'APPROVED' && l.type === 'PAID')
                    .reduce((acc, curr) => acc + (curr.days || 0), 0);
                const approvedSick = data.leaves
                    .filter(l => l.status === 'APPROVED' && l.type === 'SICK')
                    .reduce((acc, curr) => acc + (curr.days || 0), 0);

                setAvailableLeave({
                    paid: Math.max(0, 24 - approvedPaid),
                    sick: Math.max(0, 7 - approvedSick)
                });
            }
        } catch (err) {
            console.error('Failed to fetch leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchLeaves();
        }
    }, [session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ type: 'PAID', startDate: '', endDate: '', reason: '', days: 1 });
                fetchLeaves();
            }
        } catch (err) {
            console.error('Failed to submit leave:', err);
        }
    };

    return (
        <div className="min-h-screen flex">
            <EmployeeSidebar />
            
            <main className="flex-1 ml-64 p-8" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fafafa'
            }}>
                <div className="mb-10">
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">STAFF_PORTAL / LEAVE_MANAGEMENT</h2>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-2 italic underline underline-offset-8 decoration-4 decoration-blue-500">Time Off Requests</h1>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Submit and Track Your Leave Applications</p>
                        </div>
                        <div className="flex gap-0 border-2 border-black w-fit bg-white shadow-[2px_2px_0_0_#000]">
                            <button
                                onClick={() => setSubTab('time-off')}
                                className={`text-[10px] font-black uppercase tracking-widest px-8 py-3 border-r-2 border-black ${subTab === 'time-off' ? 'bg-black text-white' : 'bg-white text-black hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all'}`}
                            >
                                Time Off
                            </button>
                            <button
                                onClick={() => setSubTab('allocation')}
                                className={`text-[10px] font-black uppercase tracking-widest px-8 py-3 ${subTab === 'allocation' ? 'bg-black text-white' : 'bg-white text-black hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all'}`}
                            >
                                Allocation Summary
                            </button>
                        </div>
                    </div>
                </div>

                {subTab === 'time-off' ? (
                    <>
                        {/* NEW Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-black text-white text-[10px] font-black px-6 py-3 border-2 border-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                            >
                                NEW REQUEST
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-0 border border-black mb-8 bg-white shadow-[4px_4px_0_0_#000]">
                            <div className="p-6 flex justify-between items-center border-r border-black">
                                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 italic">Paid time Off Balance</span>
                                <span className="text-lg font-mono font-black text-black">{availableLeave.paid.toString().padStart(2, '0')} Days Available</span>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-gray-50/50">
                                <span className="text-[11px] font-black uppercase tracking-widest text-cyan-600 italic">Sick leave Balance</span>
                                <span className="text-lg font-mono font-black text-black">{availableLeave.sick.toString().padStart(2, '0')} Days Available</span>
                            </div>
                        </div>

                        {/* Lined Grid Table */}
                        <div className="border border-black bg-white overflow-hidden shadow-[8px_8px_0_0_#000]">
                            <table className="w-full text-left text-[10px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-black">
                                        <th className="px-6 py-4 font-black uppercase tracking-widest border-r border-black">Employee</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest border-r border-black">Start Date</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest border-r border-black">End Date</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest border-r border-black">Leave Category</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest border-r border-black">Request Status</th>
                                        <th className="w-12 bg-gray-100 border-l border-black"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-mono tracking-[0.3em] animate-pulse">ANALYZING STATUS...</td></tr>
                                    ) : leaves.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic font-mono uppercase">NO ACTIVE REQUESTS FOUND</td></tr>
                                    ) : (
                                        leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4 border-r border-black font-bold text-gray-600 italic">[{leave.user?.name}]</td>
                                                <td className="px-6 py-4 border-r border-black font-mono">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                                                <td className="px-6 py-4 border-r border-black font-mono">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                                                <td className="px-6 py-4 border-r border-black text-blue-600 font-black italic uppercase tracking-tighter">{leave.type} TIME OFF</td>
                                                <td className="px-6 py-4 border-r border-black">
                                                    <span className={`px-2 py-1 border border-black font-black uppercase text-[8px] tracking-widest ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-50 text-yellow-800'
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                <td className="bg-gray-50 w-12 border-l border-black"></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] p-8 min-h-[400px] flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 border-4 border-black flex items-center justify-center bg-gray-50">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Allocation Summary</h3>
                        <p className="text-xs font-mono text-gray-500 max-w-sm text-center uppercase tracking-wider">Your annual leave balance and rollover details will appear here. No active allocations found at the moment.</p>
                    </div>
                )}

                {/* Modal - Match Design Exactly */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                        <div className="bg-white border border-black shadow-[12px_12px_0_0_#000] w-full max-w-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-black flex justify-between items-center bg-gray-50">
                                <h2 className="text-[12px] font-black uppercase tracking-widest italic">Time off Type Request form</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-black hover:scale-110 font-bold text-xl">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-y-8 items-center gap-x-12">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Employee Identity</label>
                                    <div className="text-blue-500 text-xs font-black italic uppercase border-b border-gray-100 pb-1">[{session?.user?.name}]</div>

                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Time off Category</label>
                                    <select
                                        className="text-blue-600 text-xs font-black italic uppercase bg-transparent outline-none cursor-pointer border-b border-black py-1 focus:bg-blue-50"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="PAID">[ Paid time off ]</option>
                                        <option value="SICK">[ Sick leave ]</option>
                                        <option value="UNPAID">[ Unpaid leaves ]</option>
                                    </select>

                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Period Validity</label>
                                    <div className="flex items-center gap-2 text-blue-600 font-mono font-bold italic">
                                        <input
                                            type="date"
                                            className="bg-transparent outline-none w-32 border-b border-black pb-1 uppercase text-[10px]"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                        <span className="text-gray-400 font-black text-[8px] mx-2">TERMINATING AT</span>
                                        <input
                                            type="date"
                                            className="bg-transparent outline-none w-32 border-b border-black pb-1 uppercase text-[10px]"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Day Allocation</label>
                                    <div className="flex items-center gap-2 text-blue-600 font-mono font-bold italic">
                                        <input
                                            type="number"
                                            className="bg-transparent outline-none w-16 border-b border-black text-center pb-1 text-lg"
                                            value={formData.days}
                                            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                            required
                                        />
                                        <span className="text-gray-400 font-black text-[10px] ml-4 uppercase">UNITS</span>
                                    </div>

                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Attachment Proof</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-blue-600 border border-black flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <span className="text-[8px] text-gray-400 font-black uppercase italic tracking-tighter leading-tight">(Proof required for medical leave)</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button type="submit" className="flex-1 bg-pink-500 text-white text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_#000] hover:bg-pink-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">Submit Request</button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white text-black text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Discard</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
