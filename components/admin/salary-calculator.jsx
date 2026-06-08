'use client';

import { useState, useEffect } from 'react';

export function SalaryCalculator({ employeeId, initialSalary }) {
    const [salaryData, setSalaryData] = useState({
        // Wage Type
        wageType: 'Fixed Wage',
        monthlyWage: initialSalary?.monthlyWage || 0,
        yearlyWage: initialSalary?.yearlyWage || 0,
        workingDaysPerWeek: initialSalary?.workingDaysPerWeek || 5,

        // Salary Components
        basicSalaryPercent: initialSalary?.basicSalaryPercent || 50,
        basicSalary: initialSalary?.basicSalary || 0,

        hraPercent: initialSalary?.hraPercent || 50, // 50% of Basic
        houseRentAllowance: initialSalary?.houseRentAllowance || 0,

        standardAllowance: initialSalary?.standardAllowance || 0,

        performanceBonusPercent: initialSalary?.performanceBonusPercent || 8.33,
        performanceBonus: initialSalary?.performanceBonus || 0,

        ltaPercent: initialSalary?.ltaPercent || 8.33,
        leaveTravelAllowance: initialSalary?.leaveTravelAllowance || 0,

        fuelAllowance: initialSalary?.fuelAllowance || 0,

        // PF
        employeePFPercent: initialSalary?.employeePFPercent || 12,
        employeePF: initialSalary?.employeePF || 0,

        employerPFPercent: initialSalary?.employerPFPercent || 12,
        employerPF: initialSalary?.employerPF || 0,

        // Tax
        professionalTax: initialSalary?.professionalTax || 200,
    });

    const [saving, setSaving] = useState(false);

    // Auto-calculate all components when wage changes
    useEffect(() => {
        calculateAllComponents();
    }, [salaryData.monthlyWage, salaryData.basicSalaryPercent, salaryData.hraPercent]);

    const calculateAllComponents = () => {
        const wage = parseFloat(salaryData.monthlyWage) || 0;

        // Yearly Wage = Monthly × 12
        const yearly = wage * 12;

        // Basic = 50% of Monthly Wage
        const basic = (wage * salaryData.basicSalaryPercent) / 100;

        // HRA = 50% of Basic
        const hra = (basic * salaryData.hraPercent) / 100;

        // Performance Bonus = 8.33% of wage
        const bonus = (wage * salaryData.performanceBonusPercent) / 100;

        // LTA = 8.33% of wage
        const lta = (wage * salaryData.ltaPercent) / 100;

        // Employee PF = 12% of Basic
        const empPF = (basic * salaryData.employeePFPercent) / 100;

        // Employer PF = 12% of Basic
        const empRPF = (basic * salaryData.employerPFPercent) / 100;

        setSalaryData(prev => ({
            ...prev,
            yearlyWage: yearly,
            basicSalary: basic,
            houseRentAllowance: hra,
            performanceBonus: bonus,
            leaveTravelAllowance: lta,
            employeePF: empPF,
            employerPF: empRPF,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/employees/${employeeId}/salary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salaryData),
            });

            if (response.ok) {
                alert('Salary structure saved successfully!');
            } else {
                alert('Failed to save salary structure');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving salary structure');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Important Notice - Brutalist Style */}
            <div className="border-2 border-black bg-yellow-50 p-6 shadow-[4px_4px_0_0_#000]">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 border-2 border-black bg-yellow-400 flex items-center justify-center">
                            <span className="text-black font-black text-lg">!</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-3 font-mono italic">SYSTEM_PROTOCOL // FINANCIAL_NODES</h3>
                        <div className="text-[9px] font-mono font-bold text-gray-700 space-y-2 leading-relaxed">
                            <p>WAGE_TYPE: FIXED_WAGE // AUTO_CALCULATION_ENABLED</p>
                            <p>COMPONENTS: BASIC, HRA, STANDARD_ALLOWANCE, PERFORMANCE_BONUS, LTA, FIXED_ALLOWANCE</p>
                            <p>PF_RATE: 12% // PROFESSIONAL_TAX: 200</p>
                            <p className="italic text-gray-500">ALL_VALUES_AUTO_UPDATE_ON_WAGE_CHANGE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wage Information - Brutalist Style */}
            <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-black"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">WAGE_CONFIGURATION</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-black p-4 bg-gray-50/50">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">WAGE_TYPE</label>
                        <input
                            type="text"
                            value={salaryData.wageType}
                            disabled
                            className="w-full px-4 py-3 border-2 border-black bg-gray-100 text-[10px] font-black uppercase tracking-widest font-mono"
                        />
                    </div>
                    <div className="border border-black p-4 bg-gray-50/50">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">WORKING_DAYS_PER_WEEK</label>
                        <input
                            type="number"
                            value={salaryData.workingDaysPerWeek}
                            onChange={(e) => setSalaryData({ ...salaryData, workingDaysPerWeek: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                        />
                    </div>
                    <div className="border border-black p-4 bg-gray-50/50">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">MONTHLY_WAGE [₹]</label>
                        <input
                            type="number"
                            value={salaryData.monthlyWage}
                            onChange={(e) => setSalaryData({ ...salaryData, monthlyWage: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border-2 border-black text-lg font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                            placeholder="50000"
                        />
                    </div>
                    <div className="border border-black p-4 bg-gray-50/50">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">YEARLY_WAGE [₹] // AUTO_CALC</label>
                        <input
                            type="number"
                            value={salaryData.yearlyWage}
                            disabled
                            className="w-full px-4 py-3 border-2 border-black bg-gray-100 text-lg font-black text-green-600 uppercase tracking-widest font-mono"
                        />
                        <p className="text-[7px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-1">FORMULA: MONTHLY × 12</p>
                    </div>
                </div>
            </div>

            {/* Salary Components - Brutalist Style */}
            <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0_0_#0064ff]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-blue-600"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">SALARY_COMPONENTS</h3>
                </div>
                <div className="space-y-6">
                    {/* Basic Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">BASIC_SALARY</label>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.basicSalaryPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, basicSalaryPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="50"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.basicSalary.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* HRA */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">HOUSE_RENT_ALLOWANCE [HRA]</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">50% OF BASIC</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.hraPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, hraPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="50"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.houseRentAllowance.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* Standard Allowance */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">STANDARD_ALLOWANCE</label>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">FIXED_AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.standardAllowance}
                                onChange={(e) => setSalaryData({ ...salaryData, standardAllowance: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                placeholder="167"
                            />
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.standardAllowance}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* Performance Bonus */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">PERFORMANCE_BONUS</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">8.33% OF WAGE</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={salaryData.performanceBonusPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, performanceBonusPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="8.33"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.performanceBonus.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* Leave Travel Allowance */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">LEAVE_TRAVEL_ALLOWANCE [LTA]</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">8.333% OF WAGE</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={salaryData.ltaPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, ltaPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="8.333"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.leaveTravelAllowance.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* Fixed Allowance */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">FIXED_ALLOWANCE</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">REMAINING_AMOUNT</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">FIXED_AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.fuelAllowance}
                                onChange={(e) => setSalaryData({ ...salaryData, fuelAllowance: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.fuelAllowance}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-green-100 text-[9px] font-black text-green-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PF Contribution - Brutalist Style */}
            <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0_0_#ef4444]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-red-600"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">PROVIDENT_FUND [PF]_CONTRIBUTION</h3>
                </div>
                <div className="space-y-6">
                    {/* Employee PF */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">EMPLOYEE_PF</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">12% OF BASIC</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.employeePFPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, employeePFPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="12"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.employeePF.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-red-100 text-[9px] font-black text-red-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    {/* Employer PF */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-6 border-b-2 border-black">
                        <div className="md:col-span-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">EMPLOYER_PF</label>
                            <p className="text-[7px] font-mono font-bold text-gray-500 uppercase">12% OF BASIC</p>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">PERCENTAGE [%]</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.employerPFPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, employerPFPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                                    placeholder="12"
                                />
                                <span className="text-[8px] font-black text-gray-400 font-mono">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                            <input
                                type="number"
                                value={salaryData.employerPF.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border-2 border-black bg-red-100 text-[9px] font-black text-red-700 uppercase tracking-widest font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Deductions - Brutalist Style */}
            <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-black"></div>
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] font-mono italic">TAX_DEDUCTIONS</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">PROFESSIONAL_TAX</label>
                    </div>
                    <div>
                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">FIXED_AMOUNT [₹]</label>
                        <input
                            type="number"
                            value={salaryData.professionalTax}
                            onChange={(e) => setSalaryData({ ...salaryData, professionalTax: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border-2 border-black text-[9px] font-black uppercase tracking-widest font-mono focus:shadow-[2px_2px_0_0_#000] transition-all"
                            placeholder="200"
                        />
                    </div>
                    <div>
                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1 block">AMOUNT [₹]</label>
                        <input
                            type="number"
                            value={salaryData.professionalTax}
                            disabled
                            className="w-full px-3 py-2 border-2 border-black bg-red-100 text-[9px] font-black text-red-700 uppercase tracking-widest font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button - Brutalist Style */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all flex items-center gap-3 active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {saving ? 'SAVING_DATA...' : 'SAVE_SALARY_STRUCTURE'}
                </button>
            </div>
        </div>
    );
}
