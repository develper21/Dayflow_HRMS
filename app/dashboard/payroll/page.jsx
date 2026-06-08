'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';

export default function EmployeePayrollPage() {
    const { data: session } = useSession();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const res = await fetch('/api/payroll');
                if (res.ok) {
                    const data = await res.json();
                    setPayslips(data.payrolls || []);
                }
            } catch (err) {
                console.error('Failed to fetch payroll', err);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchPayroll();
    }, [session]);

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
                <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">PAYROLL_INFORMATION</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="mb-10">
                        <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">FINANCIAL_STATEMENTS / REVENUE_REGISTRY</h2>

                        <div className="grid grid-cols-3 gap-0 border-2 border-black bg-white shadow-[4px_4px_0_0_#000] mb-10">
                            <div className="p-8 border-r-2 border-black">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 italic">LATEST_NET_DISBURSEMENT</p>
                                <p className="text-4xl font-mono font-black text-black tracking-tighter">
                                    {payslips.length > 0 ? `₹${payslips[0].netSalary.toLocaleString()}` : '₹00,000'}
                                </p>
                            </div>
                            <div className="p-8 border-r-2 border-black bg-gray-50/50">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2 italic">CUMULATIVE_EARNINGS_YTD</p>
                                <p className="text-4xl font-mono font-black text-black tracking-tighter">
                                    ₹{payslips.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-8">
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2 italic">REGISTRY_STATUS</p>
                                <p className="text-4xl font-mono font-black text-black tracking-tighter">VERIFIED</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                            <thead>
                                <tr className="bg-black text-white shrink-0">
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Accounting Period</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Base Allocation</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Total Allowances</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Statutory Deductions</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Net Disbursement</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest border-r-2 border-white/20">Audit State</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-center">Documentation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black font-mono">
                                {loading ? (
                                    <tr><td colSpan="7" className="px-8 py-20 text-center text-gray-400 font-mono tracking-[0.4em] animate-pulse">EXTRACTING FINANCIAL_METADATA...</td></tr>
                                ) : payslips.length === 0 ? (
                                    <tr><td colSpan="7" className="px-8 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest">ERROR: NO PAYROLL_DATA_FOUND</td></tr>
                                ) : (
                                    payslips.map((slip) => (
                                        <tr key={slip.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-5 border-r-2 border-black font-black text-black italic bg-gray-50/30">
                                                {new Date(0, slip.month - 1).toLocaleString('default', { month: 'long' }).toUpperCase()} {slip.year}
                                            </td>
                                            <td className="px-8 py-5 border-r-2 border-black font-bold">₹{slip.basicSalary.toLocaleString()}</td>
                                            <td className="px-8 py-5 border-r-2 border-black font-black text-green-600 italic">+₹{slip.allowances.toLocaleString()}</td>
                                            <td className="px-8 py-5 border-r-2 border-black font-black text-red-500 italic">-₹{slip.deductions.toLocaleString()}</td>
                                            <td className="px-8 py-5 border-r-2 border-black font-black text-blue-700 bg-blue-50/30 font-mono text-xs">₹{slip.netSalary.toLocaleString()}</td>
                                            <td className="px-8 py-5 border-r-2 border-black">
                                                <div className={`inline-flex px-3 py-1 border-2 border-black font-black uppercase text-[8px] tracking-[0.2em] shadow-[1px_1px_0_0_#000] ${slip.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                                                    {slip.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button className="bg-white border-2 border-black px-4 py-2 text-[8px] font-black uppercase tracking-widest hover:bg-black hover:text-white hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all shadow-[2px_2px_0_0_#000]">DOWNLOAD_PDF</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
