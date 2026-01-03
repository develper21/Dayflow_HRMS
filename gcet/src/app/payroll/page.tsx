'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, DollarSign, Download, FileText } from 'lucide-react';

interface PayrollRecord {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossSalary: string;
  totalDeductions: string;
  netSalary: string;
  payableDays: number;
  payslipUrl?: string;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUser();
    fetchPayrollRecords();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Redirect admin/HR users to admin view
        if (userData.role === 'admin' || userData.role === 'hr') {
          router.push('/payroll/admin');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const fetchPayrollRecords = async () => {
    try {
      const response = await fetch('/api/payroll/me');
      if (response.ok) {
        const data = await response.json();
        setPayrollRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch payroll records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPayPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
  };

  const getStatusColor = (status: string) => {
    return 'text-green-600 bg-green-100';
  };

  const filteredRecords = payrollRecords.filter(record =>
    formatPayPeriod(record.payPeriodStart, record.payPeriodEnd).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">DF</span>
                  </div>
                </Link>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Employees
                </Link>
                <Link
                  href="/attendance"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Attendance
                </Link>
                <Link
                  href="/leave"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Time Off
                </Link>
                <Link
                  href="/payroll"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Payroll
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            </div>
          </div>

          {/* Payroll Records */}
          <div className="px-6 py-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Payroll records will appear here once they are generated.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pay Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payable Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPayPeriod(record.payPeriodStart, record.payPeriodEnd)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(record.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(record.grossSalary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-red-600">
                            -{formatCurrency(record.totalDeductions)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(record.netSalary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.payableDays} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('processed')}`}>
                            Processed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.payslipUrl && (
                            <button
                              onClick={() => window.open(record.payslipUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
