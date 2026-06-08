'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function EmployeesPage() {
    const { data: session } = useSession();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/admin/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

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
                    <h2 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.3em] font-mono italic">SYSTEM.ADMINISTRATION / WORKFORCE_REGISTRY</h2>
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-black text-black uppercase tracking-tight italic">Employee Database</h1>
                        <Link href="/admin/employees/new">
                            <button className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all flex items-center gap-3 active:translate-x-1 active:translate-y-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                REGISTER_NEW_ENTITY
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="SCANNING_REGISTRY_BY_NAME_OR_ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-black text-[10px] font-black outline-none italic placeholder:text-gray-300 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none transition-all uppercase tracking-widest font-mono"
                        />
                        <svg className="w-5 h-5 text-black absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="bg-blue-600 text-white text-[10px] font-black px-6 py-3 border-2 border-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_#000]">
                        TOTAL_ENTITIES: {employees.length}
                    </div>
                </div>

                <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 italic">IDENTIFIED_ENTITY</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">SYSTEM_ID</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">NETWORK_EMAIL</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">ASSIGNED_UNIT</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">FUNCTIONAL_ROLE</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-center italic">EXECUTIVE_ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black font-mono">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-mono tracking-[0.4em] animate-pulse">SYNCHRONIZING_REGISTRY...</td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center text-gray-400 font-black italic uppercase tracking-widest">ZERO_ENTITIES_DETECTED_IN_SCAN</td></tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 border-r border-black font-black text-black italic bg-gray-50/30">
                                            {employee.name}
                                        </td>
                                        <td className="px-8 py-5 border-r border-black font-bold text-blue-600">{employee.employeeId || 'UNDEFINED'}</td>
                                        <td className="px-8 py-5 border-r border-black font-bold text-gray-500">{employee.email}</td>
                                        <td className="px-8 py-5 border-r border-black font-black uppercase tracking-widest">{employee.jobDetails?.department || 'UNASSIGNED'}</td>
                                        <td className="px-8 py-5 border-r border-black font-black uppercase tracking-widest">{employee.jobDetails?.jobPosition || 'UNDEFINED'}</td>
                                        <td className="px-8 py-5 text-center">
                                            <Link
                                                href={`/admin/employees/${employee.id}`}
                                                className="inline-block px-6 py-2 bg-white border-2 border-black text-[8px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:shadow-none"
                                            >
                                                ACCESS_PROFILE
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

