'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function EmployeesPage() {
    const { data: session } = useSession();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <DashboardLayout
            companyName={session?.user?.companyName}
            companyLogo={session?.user?.companyLogo}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
                        <p className="text-gray-600 mt-2">Manage your company employees</p>
                    </div>
                    <Link href="/admin/employees/new">
                        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                            + Add New Employee
                        </button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-gray-500 text-center py-8">Loading...</p>
                        ) : employees.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Employee
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Login ID
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Department
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Position
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                                            {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {employee.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">
                                                    {employee.employeeId}
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">
                                                    {employee.email}
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">
                                                    {employee.jobDetails?.department || '-'}
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">
                                                    {employee.jobDetails?.jobPosition || '-'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Link
                                                        href={`/admin/employees/${employee.id}`}
                                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                                    >
                                                        View Profile →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">No employees found</p>
                                <Link href="/admin/employees/new">
                                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                                        Add Your First Employee
                                    </button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

