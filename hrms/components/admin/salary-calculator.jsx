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
        <div className="space-y-6">
            {/* Important Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                        <div className="mt-2 text-sm text-yellow-700 space-y-2">
                            <p>The Salary Information tab allows users to define and manage all salary-related details for an employee, including wage type, working schedule, salary components, benefits. Salary components should be calculated automatically based on the defined Wage.</p>

                            <p className="font-semibold mt-3">Wage Type:</p>
                            <p>- Fixed Wage</p>

                            <p className="font-semibold mt-3">- Salary Components:</p>
                            <p>Section where users can define salary structure components.</p>

                            <p className="mt-2">Each component should include:</p>
                            <p>Basic, House Rent Allowance, Standard Allowance, Performance Bonus, Leave Travel Allowance, Fixed Allowance</p>

                            <p className="font-semibold mt-3">Computation Type: Fixed Amount or Percentage of Wage</p>
                            <p>Value: Percentage field (e.g., 50% for Basic, 50% of Basic for HRA, Standard Allowance ₹167, Performance Bonus 8.33%, Leave Travel Allowance 8.333%, Fixed allowance is % wage - total of all the component)</p>

                            <p className="mt-2">Salary component values should auto-update when the wage amount changes. The total of all components should not exceed the defined Wage.</p>

                            <p className="font-semibold mt-3">- Automatic Calculation:</p>
                            <p>The system should calculate each component amount based on the employee's defined wage.</p>

                            <p className="font-semibold mt-3">Example:</p>
                            <p>If Wage = ₹50,000 and Basic = 50% of wage, then Basic = ₹25,000.</p>
                            <p>If HRA = 50% of Basic, then HRA = ₹12,500.</p>

                            <p className="mt-2">Each fields for configuration (e.g., PF rate 12%).</p>
                            <p>and Professional Tax 200</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wage Information */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wage Information</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Wage Type</label>
                        <input
                            type="text"
                            value={salaryData.wageType}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Days Per Week</label>
                        <input
                            type="number"
                            value={salaryData.workingDaysPerWeek}
                            onChange={(e) => setSalaryData({ ...salaryData, workingDaysPerWeek: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Wage (₹)</label>
                        <input
                            type="number"
                            value={salaryData.monthlyWage}
                            onChange={(e) => setSalaryData({ ...salaryData, monthlyWage: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                            placeholder="50000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Wage (₹)</label>
                        <input
                            type="number"
                            value={salaryData.yearlyWage}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold text-lg text-primary-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated: Monthly × 12</p>
                    </div>
                </div>
            </div>

            {/* Salary Components */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Components</h3>
                <div className="space-y-4">
                    {/* Basic Salary */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.basicSalaryPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, basicSalaryPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="50"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.basicSalary.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>

                    {/* HRA */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">House Rent Allowance (HRA)</label>
                            <p className="text-xs text-gray-500">50% of Basic</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage of Basic</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.hraPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, hraPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="50"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.houseRentAllowance.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>

                    {/* Standard Allowance */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Standard Allowance</label>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Fixed Amount</label>
                            <input
                                type="number"
                                value={salaryData.standardAllowance}
                                onChange={(e) => setSalaryData({ ...salaryData, standardAllowance: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="167"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.standardAllowance}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>

                    {/* Performance Bonus */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Performance Bonus</label>
                            <p className="text-xs text-gray-500">8.33% of Wage</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={salaryData.performanceBonusPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, performanceBonusPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="8.33"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.performanceBonus.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>

                    {/* Leave Travel Allowance */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Leave Travel Allowance</label>
                            <p className="text-xs text-gray-500">8.333% of Wage</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={salaryData.ltaPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, ltaPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="8.333"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.leaveTravelAllowance.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>

                    {/* Fixed Allowance */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Fixed Allowance</label>
                            <p className="text-xs text-gray-500">Remaining amount</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Fixed Amount</label>
                            <input
                                type="number"
                                value={salaryData.fuelAllowance}
                                onChange={(e) => setSalaryData({ ...salaryData, fuelAllowance: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.fuelAllowance}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 font-medium text-green-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PF Contribution */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Provident Fund (PF) Contribution</h3>
                <div className="space-y-4">
                    {/* Employee PF */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Employee PF</label>
                            <p className="text-xs text-gray-500">12% of Basic</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.employeePFPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, employeePFPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="12"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.employeePF.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-red-50 font-medium text-red-700"
                            />
                        </div>
                    </div>

                    {/* Employer PF */}
                    <div className="grid grid-cols-4 gap-4 items-end pb-4 border-b">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Employer PF</label>
                            <p className="text-xs text-gray-500">12% of Basic</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={salaryData.employerPFPercent}
                                    onChange={(e) => setSalaryData({ ...salaryData, employerPFPercent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="12"
                                />
                                <span className="text-gray-600">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={salaryData.employerPF.toFixed(2)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-red-50 font-medium text-red-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Deductions */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tax Deductions</h3>
                <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Professional Tax</label>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Fixed Amount</label>
                        <input
                            type="number"
                            value={salaryData.professionalTax}
                            onChange={(e) => setSalaryData({ ...salaryData, professionalTax: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <input
                            type="number"
                            value={salaryData.professionalTax}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-red-50 font-medium text-red-700"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Salary Structure'}
                </button>
            </div>
        </div>
    );
}
