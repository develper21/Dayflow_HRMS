'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AddEmployeeForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        residingAddress: '',
        jobPosition: '',
        department: '',
        dateOfJoining: '',
        manager: '',
        workLocation: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        panNumber: '',
        uanNumber: '',
        monthlyWage: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(null);

        try {
            const response = await fetch('/api/admin/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    monthlyWage: formData.monthlyWage ? parseFloat(formData.monthlyWage) : undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create employee');
            }

            setSuccess(result.employee);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="bg-white border-[3px] border-black shadow-[16px_16px_0_0_#22c55e] p-10 mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-green-500 border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-black uppercase italic tracking-tight">ENTITY_INITIALIZED</h3>
                            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest">Protocol validation successful</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 border border-black p-6 shadow-[4px_4px_0_0_#000]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono">ASSIGNED_SYSTEM_ID</p>
                            <p className="text-3xl font-black text-blue-600 font-mono italic">{success.employeeId}</p>
                        </div>
                        <div className="bg-black p-6 shadow-[4px_4px_0_0_#000]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 font-mono">TEMPORARY_ACCESS_TOKEN</p>
                            <p className="text-3xl font-black text-red-500 font-mono tracking-tighter">{success.password}</p>
                        </div>
                        <div className="border border-black p-4 bg-yellow-50 italic">
                            <p className="text-[10px] text-black font-black uppercase tracking-widest leading-loose">
                                <span className="text-red-600">⚠ CRITICAL:</span> TRANSMIT THESE CREDENTIALS TO THE SUBJECT IMMEDIATELY. DATA PURGE INITIATED. PASSWORD RECOVERY DISABLED.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6">
                    <button onClick={() => router.push('/admin')} className="flex-1 bg-black text-white text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[6px_6px_0_0_#000] active:shadow-none">RETURN_TO_BASE</button>
                    <button onClick={() => window.location.reload()} className="flex-1 bg-white text-black text-[10px] font-black py-4 border border-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-[6px_6px_0_0_#000] active:shadow-none">INITIALIZE_ANOTHER</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
                <div className="p-6 bg-red-600 border border-black shadow-[4px_4px_0_0_#000] flex items-center gap-4">
                    <div className="w-8 h-8 bg-white flex items-center justify-center font-black text-red-600">!</div>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest font-mono">PROTOCOL_ERROR: {error}</p>
                </div>
            )}

            {/* General Grid Layout for all sections */}
            <div className="space-y-12 pb-20">
                {/* Personal Information */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-2 h-8 bg-black"></div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">01 // PERSONAL_PROFILE [MANDATORY]</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8 bg-white border border-black p-10 shadow-[8px_8px_0_0_#000]">
                        {[
                            { label: 'IDENTIFIER:FIRST_NAME', name: 'firstName', type: 'text', required: true },
                            { label: 'IDENTIFIER:LAST_NAME', name: 'lastName', type: 'text', required: true },
                            { label: 'DIGITAL_ADDRESS:EMAIL', name: 'email', type: 'email', required: true },
                            { label: 'TELECOM:PHONE_NUMBER', name: 'phone', type: 'text', placeholder: '10 DIGITS' },
                            { label: 'CHRONO:DATE_OF_BIRTH', name: 'dateOfBirth', type: 'date' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 border border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic placeholder:text-gray-200"
                                />
                            </div>
                        ))}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-mono">BIOLOGY:GENDER_SELECT</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic appearance-none"
                            >
                                <option value="">NULL</option>
                                <option value="Male">MALE</option>
                                <option value="Female">FEMALE</option>
                                <option value="Other">OTHER</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-2 h-8 bg-black"></div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">02 // PROFESSIONAL_HIERARCHY [MANDATORY]</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8 bg-white border border-black p-10 shadow-[8px_8px_0_0_#000]">
                        {[
                            { label: 'FUNCTIONAL_ROLE:POSITION', name: 'jobPosition', required: true },
                            { label: 'ORGANIZATIONAL_UNIT:DEPT', name: 'department', required: true },
                            { label: 'CYCLE_INIT:JOINING_DATE', name: 'dateOfJoining', type: 'date', required: true },
                            { label: 'AUTHORITY:MANAGER', name: 'manager' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    required={field.required}
                                    className="w-full px-4 py-3 border border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Parameters */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-2 h-8 bg-gray-400"></div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">03 // FINANCIAL_NODE_PARAMETERS [OPTIONAL]</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8 bg-white border border-black p-10 shadow-[8px_8px_0_0_#000]">
                        {[
                            { label: 'BANKING:INSTITUTION_NAME', name: 'bankName' },
                            { label: 'BANKING:ACCOUNT_NUMBER', name: 'accountNumber' },
                            { label: 'BANKING:IFSC_CODE', name: 'ifscCode' },
                            { label: 'TAXATION:PAN_IDENTIFIER', name: 'panNumber' },
                            { label: 'REMUNERATION:MONTHLY_WAGE', name: 'monthlyWage', type: 'number', placeholder: '50000' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block font-mono">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 border border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono italic placeholder:text-gray-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white text-xs font-black py-6 border-b-4 border-r-4 border-blue-600 uppercase tracking-[0.4em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0_0_#000] disabled:opacity-50"
                >
                    {loading ? 'EXECUTING_INITIALIZATION_PROTOCOL...' : 'COMMIT_SYSTEM_REGISTRATION'}
                </button>
            </div>
        </form>
    );
}
