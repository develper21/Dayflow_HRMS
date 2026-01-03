'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  FileText, 
  Download, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Filter,
  Settings
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui';
import { Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import { SmartInput } from '@/components/ui/smart-input';

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

  const fetchUser = useCallback(async () => {
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
    } catch {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchPayrollRecords = useCallback(async () => {
    try {
      const response = await fetch('/api/payroll/me');
      if (response.ok) {
        const data = await response.json();
        setPayrollRecords(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchPayrollRecords();
  }, [fetchUser, fetchPayrollRecords]);

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

  const filteredRecords = payrollRecords.filter(record =>
    formatPayPeriod(record.payPeriodStart, record.payPeriodEnd).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return 'text-green-600 bg-green-100';
  };

  const handleViewPayslip = (payslipUrl: string | null, payrollId: string) => {
    if (payslipUrl) {
      // For now, open in new tab. In future, this could open a modal
      window.open(payslipUrl, '_blank');
    }
  };

  const handleDownloadPayslip = async (payslipUrl: string | null, payrollId: string) => {
    if (!payslipUrl) return;
    
    try {
      const response = await fetch(payslipUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `payslip_${payrollId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch {
      console.error('Failed to download payslip');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading payroll data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payroll Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your salary slips and payroll information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/payroll/history">
              <ProButton variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View History
              </ProButton>
            </Link>
            <ProButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </ProButton>
          </div>
        </div>

        {/* Quick Actions */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>Quick Actions</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/payroll/history">
                <ProButton variant="outline" fullWidth className="justify-start">
                  <Calendar className="w-4 h-4 mr-3" />
                  Payroll History
                </ProButton>
              </Link>
              <Link href="/payroll/tax">
                <ProButton variant="outline" fullWidth className="justify-start">
                  <FileText className="w-4 h-4 mr-3" />
                  Tax Documents
                </ProButton>
              </Link>
              <Link href="/payroll/settings">
                <ProButton variant="outline" fullWidth className="justify-start">
                  <Settings className="w-4 h-4 mr-3" />
                  Payroll Settings
                </ProButton>
              </Link>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Salary</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">
                    {payrollRecords.length > 0 ? formatCurrency(payrollRecords[0].netSalary) : '₹0'}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Latest month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">
                    {payrollRecords.length > 0 
                      ? formatCurrency(payrollRecords.reduce((sum, record) => sum + parseFloat(record.netSalary), 0).toString())
                      : '₹0'
                    }
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">All time</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payroll Records</p>
                  <p className="text-2xl font-semibold text-purple-600 mt-1">{payrollRecords.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <FileText className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600">Total slips</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Working Days</p>
                  <p className="text-2xl font-semibold text-orange-600 mt-1">
                    {payrollRecords.length > 0 
                      ? Math.round(payrollRecords.reduce((sum, record) => sum + record.payableDays, 0) / payrollRecords.length)
                      : 0
                    }
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Per month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Filters */}
        <EnterpriseCard>
          <EnterpriseCardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
                <SmartInput
                  placeholder="Search payroll records..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  className="max-w-md"
                />
                
                <Input
                  placeholder="Employee ID..."
                  className="max-w-xs"
                />
                
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Periods</option>
                  <option value="current">Current Month</option>
                  <option value="last">Last 3 Months</option>
                  <option value="year">This Year</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <ProButton variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </ProButton>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Payroll Records Table */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <div className="flex items-center justify-between">
              <EnterpriseCardTitle>
                Payroll Records ({filteredRecords.length})
              </EnterpriseCardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Your salary history
                </span>
              </div>
            </div>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="p-0">
            {filteredRecords.length === 0 ? (
              <DataTableEmpty
                title="No payroll records"
                description="Payroll records will appear here once they are generated."
                icon={<CheckCircle className="w-16 h-16 text-gray-400" />}
              />
            ) : (
              <DataTable>
                <DataTableHeader>
                  <DataTableHeaderCell>Pay Period</DataTableHeaderCell>
                  <DataTableHeaderCell>Gross Salary</DataTableHeaderCell>
                  <DataTableHeaderCell>Deductions</DataTableHeaderCell>
                  <DataTableHeaderCell>Net Salary</DataTableHeaderCell>
                  <DataTableHeaderCell>Working Days</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Actions</DataTableHeaderCell>
                </DataTableHeader>
                <DataTableBody>
                  {filteredRecords.map((record) => (
                    <DataTableRow key={record.id} hover>
                      <DataTableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatPayPeriod(record.payPeriodStart, record.payPeriodEnd)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(record.createdAt)}
                            </div>
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {formatCurrency(record.grossSalary)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-red-600">
                          -{formatCurrency(record.totalDeductions)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(record.netSalary)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {record.payableDays} days
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge variant="success">
                          Processed
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center space-x-2">
                          {record.payslipUrl ? (
                            <>
                              <ProButton variant="ghost" size="sm" onClick={() => handleViewPayslip(record.payslipUrl || null, record.id)}>
                                <FileText className="w-4 h-4 mr-1" />
                                View
                              </ProButton>
                              <ProButton variant="ghost" size="sm" onClick={() => handleDownloadPayslip(record.payslipUrl || null, record.id)}>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </ProButton>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Not Available</span>
                          )}
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </Layout>
  );
}
