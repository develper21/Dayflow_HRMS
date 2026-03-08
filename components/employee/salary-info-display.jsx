'use client';

export function SalaryInfoDisplay({ salaryInfo, monthlyWage }) {
    if (!salaryInfo && !monthlyWage) {
        return (
            <div className="p-6">
                <p className="text-gray-600">No salary information available.</p>
            </div>
        );
    }

    const wage = monthlyWage || salaryInfo?.monthlyWage || 0;
    const yearlyWage = wage * 12;

    // Calculate components
    const basic = (wage * 50) / 100;
    const hra = (wage * 20) / 100;
    const standardAllowance = (wage * 10) / 100;
    const performanceBonus = (wage * 10) / 100;
    const leaveTravelAllowance = (wage * 5) / 100;
    const professionalTax = (wage * 2) / 100;
    const providentFund = (wage * 3) / 100;

    const ComponentRow = ({ label, amount, percentage }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-700">{label}</span>
            <div className="text-right">
                <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Monthly Wage</p>
                    <p className="text-2xl font-bold text-primary-600">₹{wage.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-secondary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Yearly Wage</p>
                    <p className="text-2xl font-bold text-secondary-600">₹{yearlyWage.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-bold mb-4">Salary Components</h4>
                <ComponentRow label="Basic Salary" amount={basic} percentage="50" />
                <ComponentRow label="HRA" amount={hra} percentage="20" />
                <ComponentRow label="Standard Allowance" amount={standardAllowance} percentage="10" />
                <ComponentRow label="Performance Bonus" amount={performanceBonus} percentage="10" />
                <ComponentRow label="Leave Travel Allowance" amount={leaveTravelAllowance} percentage="5" />

                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                    <h4 className="font-bold mb-2">Deductions</h4>
                    <ComponentRow label="Professional Tax" amount={professionalTax} percentage="2" />
                    <ComponentRow label="Provident Fund" amount={providentFund} percentage="3" />
                </div>
            </div>
        </div>
    );
}
