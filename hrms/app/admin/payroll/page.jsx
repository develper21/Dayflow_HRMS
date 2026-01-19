'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { NotificationBell } from '@/components/ui/notification-bell';

export default function AdminPayrollPage() {
    const { data: session } = useSession();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('structures'); // Default to structures so admin can set pay first
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [salaryStructure, setSalaryStructure] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [payrollRes, employeeRes] = await Promise.all([
                fetch('/api/payroll'),
                fetch('/api/admin/employees')
            ]);

            if (payrollRes.ok) {
                const data = await payrollRes.json();
                setPayrolls(data.payrolls);
            }
            if (employeeRes.ok) {
                const data = await employeeRes.json();
                setEmployees(data.employees);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryStructure = async (userId) => {
        try {
            const res = await fetch(`/api/salary-structure?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSalaryStructure(data.salary);
            }
        } catch (err) {
            console.error('Failed to fetch salary:', err);
        }
    };

    useEffect(() => {
        if (session) fetchAllData();
    }, [session]);

    const handleGeneratePayroll = async () => {
        if (!confirm(`Generate payroll for all employees for ${new Date(0, selectedDate.month - 1).toLocaleString('default', { month: 'long' })} ${selectedDate.year}?`)) return;

        setIsGenerating(true);
        try {
            // Sequential generation for each employee to ensure accuracy
            for (const emp of employees) {
                await fetch('/api/payroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: emp.id,
                        month: selectedDate.month,
                        year: selectedDate.year
                    }),
                });
            }
            fetchAllData();
            alert('Payroll generated successfully!');
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdateSalary = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/salary-structure', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.id, ...salaryStructure }),
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchAllData();
            }
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const filteredEmployees = employees.filter(e =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredPayrolls = payrolls.filter(p =>
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) &&
        (p.month === selectedDate.month && p.year === selectedDate.year)
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Lined Top Navigation */}
            <nav className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border border-black flex items-center justify-center overflow-hidden bg-white font-black text-xs uppercase">
                                    {session?.user?.companyLogo ? (
                                        <img src={session.user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-black font-black italic">LOGO</span>
                                    )}
                                </div>
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
                                <Link href="/admin" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Employees
                                </Link>
                                <Link href="/admin/attendance" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Attendance
                                </Link>
                                <Link href="/admin/time-off" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black border-r border-black hover:bg-gray-100 transition-colors">
                                    Time Off
                                </Link>
                                <Link href="/admin/payroll" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-black hover:bg-gray-900 transition-colors">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 border border-black p-8 bg-white shadow-[8px_8px_0_0_#000]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic mb-2">Payroll Execution Core</h2>
                            <p className="text-2xl font-black text-black uppercase tracking-tight">Financial Governance</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-black p-6 shadow-[4px_4px_0_0_#000] min-w-[250px]">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1 italic">Company Payout Liability</p>
                                <p className="text-3xl font-mono font-black text-black">₹{payrolls.reduce((acc, p) => acc + (p.month === selectedDate.month ? p.netSalary : 0), 0).toLocaleString()}</p>
                                <p className="text-[8px] font-black text-gray-400 mt-2 uppercase tracking-widest">{new Date(0, selectedDate.month - 1).toLocaleString('default', { month: 'long' }).toUpperCase()} {selectedDate.year} CYCLE</p>
                            </div>
                            <div className="bg-black p-6 shadow-[4px_4px_0_0_#000] flex flex-col justify-center">
                                <button
                                    onClick={handleGeneratePayroll}
                                    disabled={isGenerating}
                                    className={`w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0_0_#fff] ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isGenerating ? 'PROCESSING...' : 'RUN_PAYROLL_GENERATOR'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-4 bg-white border border-black px-4 py-2 shadow-[2px_2px_0_0_#000]">
                        <span className="text-[8px] font-black text-gray-400 uppercase italic">Period:</span>
                        <select
                            value={selectedDate.month}
                            onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}
                            className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' }).toUpperCase()}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDate.year}
                            onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}
                            className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="FILTER BY EMPLOYEE NAME OR ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-[10px] font-black border border-black outline-none italic placeholder:text-gray-300 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none transition-all uppercase tracking-widest"
                        />
                        <svg className="w-5 h-5 text-black absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setActiveTab('structures')}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black shadow-[4px_4px_0_0_#000] active:shadow-none transition-all ${activeTab === 'structures' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                        [01_Salary_Structures]
                    </button>
                    <button
                        onClick={() => setActiveTab('payrolls')}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-black shadow-[4px_4px_0_0_#000] active:shadow-none transition-all ${activeTab === 'payrolls' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                        [02_Payment_Records]
                    </button>
                </div>

                <div className="border border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden mb-12">
                    <table className="w-full text-left text-[10px]">
                        <thead>
                            <tr className="bg-black text-white">
                                {activeTab === 'structures' ? (
                                    <>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 text-blue-400 italic">EMPLOYEE_ENTITY</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">SYSTEM_ID</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">CLASSIFICATION</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 text-center">CONFIG_LINK</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-right italic">MODIFICATION</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 text-blue-400 italic">SUBJECT</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">PERIOD_CYCLE</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">DISBURSEMENT_AMT</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">PROTOCOL_STATUS</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-right italic">AUDIT_LOG</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black font-mono">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-24 text-center text-gray-400 font-mono tracking-[0.5em] animate-pulse">CONNECTING_TO_FINANCIAL_NODE...</td></tr>
                            ) : (activeTab === 'structures' ? filteredEmployees : filteredPayrolls).length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-24 text-center text-gray-400 italic font-black uppercase tracking-widest">ERROR: EMPTY_QUERY_RESULT</td></tr>
                            ) : activeTab === 'structures' ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 border-r border-black font-black text-black italic bg-gray-100/20">{emp.name}</td>
                                        <td className="px-8 py-5 border-r border-black font-bold text-gray-400">{emp.employeeId || 'UNDEFINED'}</td>
                                        <td className="px-8 py-5 border-r border-black">
                                            <div className="bg-gray-50 border border-black px-3 py-1 text-[8px] font-black uppercase tracking-widest inline-block">{emp.role}</div>
                                        </td>
                                        <td className="px-8 py-5 border-r border-black text-center">
                                            <div className="flex justify-center">
                                                <div className="w-3 h-3 bg-green-500 border border-black shadow-[1px_1px_0_0_#000]"></div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser({ id: emp.id, name: emp.name });
                                                    fetchSalaryStructure(emp.id);
                                                    setIsModalOpen(true);
                                                }}
                                                className="bg-black text-white border border-black px-6 py-2 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[3px_3px_0_0_#000] active:shadow-none"
                                            >
                                                EDIT_FORMULA
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredPayrolls.map((payroll) => (
                                    <tr key={payroll.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 border-r border-black">
                                            <div className="font-black text-black italic bg-gray-100/20">{payroll.user?.name}</div>
                                            <div className="text-[8px] text-gray-400 mt-1 uppercase font-mono">#{payroll.user?.employeeId}</div>
                                        </td>
                                        <td className="px-8 py-5 border-r border-black font-black italic uppercase">
                                            {new Date(0, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                                        </td>
                                        <td className="px-8 py-5 border-r border-black font-black text-blue-600 text-xs">₹{payroll.netSalary.toLocaleString()}</td>
                                        <td className="px-8 py-5 border-r border-black">
                                            <div className={`px-3 py-1 border border-black text-[8px] font-black uppercase tracking-[0.2em] inline-block shadow-[1px_1px_0_0_#000] ${payroll.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                                                {payroll.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link
                                                href={`/admin/payroll/${payroll.id}`}
                                                className="bg-white border border-black px-4 py-2 text-[8px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000]"
                                            >
                                                EXTRACT_DETAILS
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Salary Structure Modal */}
            {isModalOpen && salaryStructure && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white border-[3px] border-black shadow-[16px_16px_0_0_#000] w-full max-w-2xl overflow-hidden p-10 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-2xl font-black">&times;</button>

                        <div className="mb-10">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic mb-2">Salary Formula Configuration</h3>
                            <h2 className="text-2xl font-black text-black uppercase tracking-tight italic">STRUCTURAL_EDIT: {selectedUser?.name}</h2>
                        </div>

                        <form onSubmit={handleUpdateSalary} className="grid grid-cols-2 gap-x-10 gap-y-6">
                            {[
                                { label: 'Basic Salary (Monthly)', key: 'basicSalary', color: 'text-black' },
                                { label: 'House Rent Allowance', key: 'houseRentAllowance', color: 'text-green-600' },
                                { label: 'Fuel Allowance', key: 'fuelAllowance', color: 'text-green-600' },
                                { label: 'Other Allowances', key: 'standardAllowance', color: 'text-green-600' },
                                { label: 'Employee PF (Deduction)', key: 'employeePF', color: 'text-red-500' },
                                { label: 'Professional Tax', key: 'professionalTax', color: 'text-red-500' }
                            ].map((item) => (
                                <div key={item.key} className="space-y-2 group">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">{item.label}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-[10px] font-black text-gray-300">₹</span>
                                        <input
                                            type="number"
                                            value={salaryStructure[item.key] || ''}
                                            onChange={(e) => setSalaryStructure({ ...salaryStructure, [item.key]: parseFloat(e.target.value) })}
                                            className={`w-full pl-8 pr-4 py-3 border border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all ${item.color} font-mono`}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="col-span-2 bg-black p-8 mt-4 flex justify-between items-center shadow-[4px_4px_0_0_#000]">
                                <div>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Calculated_Net_Yield</p>
                                    <p className="text-4xl font-mono font-black text-white italic">
                                        ₹{((salaryStructure.basicSalary || 0) +
                                            (salaryStructure.houseRentAllowance || 0) +
                                            (salaryStructure.fuelAllowance || 0) +
                                            (salaryStructure.standardAllowance || 0) -
                                            (salaryStructure.employeePF || 0) -
                                            (salaryStructure.professionalTax || 0)).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-3 py-1 border border-white text-[8px] font-black text-white uppercase tracking-widest mb-2">VALID_FORMULA</div>
                                    <p className="text-[8px] text-green-400 font-black uppercase tracking-tighter">Ready for cycle injection</p>
                                </div>
                            </div>

                            <div className="col-span-2 pt-6 flex gap-6">
                                <button type="submit" className="flex-1 bg-black text-white text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[6px_6px_0_0_#000] active:shadow-none">UPDATE_FINANCIAL_SCHEMA</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white text-black text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-[6px_6px_0_0_#000] active:shadow-none">ABORT_OPERATION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
