'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertCircle,
  BarChart3,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import EnterpriseCard, { EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent, EnterpriseCardFooter } from '@/components/ui/enterprise-card';
import ProButton from '@/components/ui/pro-button';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { useToastListener } from '@/hooks/useToastListener';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'present' | 'absent' | 'leave';
  profilePictureUrl?: string;
  department?: string;
  position?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePictureUrl?: string;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingLeaves: number;
  monthlyAttendance: number;
  payrollAmount: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    monthlyAttendance: 0,
    payrollAmount: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const router = useRouter();
  
  // Initialize toast listener
  useToastListener();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchEmployees = useCallback(async () => {
    setIsEmployeesLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        
        // Calculate stats
        const presentCount = data.filter((emp: Employee) => emp.status === 'present').length;
        const leaveCount = data.filter((emp: Employee) => emp.status === 'leave').length;
        
        setStats(prev => ({
          ...prev,
          totalEmployees: data.length,
          presentToday: presentCount,
          onLeave: leaveCount
        }));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setIsEmployeesLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.role !== 'employee') {
          fetchEmployees();
        }
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchEmployees]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
      });
      if (response.ok) {
        setIsCheckedIn(true);
      }
    } catch {
      // Error handling without console.log
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
      });
      if (response.ok) {
        setIsCheckedIn(false);
      }
    } catch {
      // Error handling without console.log
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const recentEmployees = employees.slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {user.firstName}! Here's what's happening today.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ProButton variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </ProButton>
            {user.role !== 'employee' && (
              <Link href="/employees/new">
                <ProButton size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </ProButton>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <EnterpriseCard hover>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalEmployees}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">12% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </EnterpriseCardContent>
            <EnterpriseCardFooter>
              <Link href="/employees" className="text-sm text-blue-600 hover:text-blue-800">
                View all employees →
              </Link>
            </EnterpriseCardFooter>
          </EnterpriseCard>

          <EnterpriseCard hover>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.presentToday}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">8% from yesterday</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </EnterpriseCardContent>
            <EnterpriseCardFooter>
              <Link href="/attendance" className="text-sm text-blue-600 hover:text-blue-800">
                View attendance →
              </Link>
            </EnterpriseCardFooter>
          </EnterpriseCard>

          <EnterpriseCard hover>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.onLeave}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600">3% from last week</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </EnterpriseCardContent>
            <EnterpriseCardFooter>
              <Link href="/leave" className="text-sm text-blue-600 hover:text-blue-800">
                Manage leave →
              </Link>
            </EnterpriseCardFooter>
          </EnterpriseCard>

          <EnterpriseCard hover>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pendingLeaves}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Need approval</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </EnterpriseCardContent>
            <EnterpriseCardFooter>
              <Link href="/leave?filter=pending" className="text-sm text-blue-600 hover:text-blue-800">
                Review requests →
              </Link>
            </EnterpriseCardFooter>
          </EnterpriseCard>

          <EnterpriseCard hover>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">+24%</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Above target</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </EnterpriseCardContent>
            <EnterpriseCardFooter>
              <Link href="/reports" className="text-sm text-blue-600 hover:text-blue-800">
                View analytics →
              </Link>
            </EnterpriseCardFooter>
          </EnterpriseCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Employees */}
          <EnterpriseCard className="lg:col-span-2">
            <EnterpriseCardHeader>
              <div className="flex items-center justify-between">
                <EnterpriseCardTitle>Recent Employees</EnterpriseCardTitle>
                <Link href="/employees">
                  <ProButton variant="ghost" size="sm">
                    View All
                  </ProButton>
                </Link>
              </div>
            </EnterpriseCardHeader>
            <EnterpriseCardContent className="p-0">
              {isEmployeesLoading ? (
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <LoadingSpinner />
                    <span className="ml-2 text-sm text-gray-600">Loading employees...</span>
                  </div>
                </div>
              ) : recentEmployees.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon="users"
                    title="No employees found"
                    description="No employees are available at the moment."
                  />
                </div>
              ) : (
                <DataTable>
                  <DataTableHeader>
                    <DataTableHeaderCell>Employee</DataTableHeaderCell>
                    <DataTableHeaderCell>Status</DataTableHeaderCell>
                    <DataTableHeaderCell>Check-in</DataTableHeaderCell>
                    <DataTableHeaderCell>Check-out</DataTableHeaderCell>
                    <DataTableHeaderCell>Work Hours</DataTableHeaderCell>
                    <DataTableHeaderCell>Actions</DataTableHeaderCell>
                  </DataTableHeader>
                  <DataTableBody>
                    {recentEmployees.map((employee) => (
                      <DataTableRow key={employee.id} hover>
                        <DataTableCell>
                          <div className="flex items-center">
                            {employee.profilePictureUrl ? (
                              <Image
                                src={employee.profilePictureUrl}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </DataTableCell>
                        <DataTableCell>
                          <StatusBadge 
                            variant={employee.status === 'present' ? 'success' : employee.status === 'leave' ? 'warning' : 'danger'}
                          >
                            {employee.status === 'present' ? 'Present' : employee.status === 'leave' ? 'On Leave' : 'Absent'}
                          </StatusBadge>
                        </DataTableCell>
                        <DataTableCell>
                          <div className="text-sm text-gray-900">
                            {employee.checkInTime || '--:--'}
                          </div>
                        </DataTableCell>
                        <DataTableCell>
                          <div className="text-sm text-gray-900">
                            {employee.checkOutTime || '--:--'}
                          </div>
                        </DataTableCell>
                        <DataTableCell>
                          <div className="text-sm text-gray-900">
                            {employee.workHours || '--'}
                          </div>
                        </DataTableCell>
                        <DataTableCell>
                          <ProButton variant="ghost" size="sm">
                            View Details
                          </ProButton>
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>

          {/* Quick Actions & Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>Quick Actions</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent className="space-y-3">
                <Link href="/attendance">
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <Clock className="w-4 h-4 mr-3" />
                    Mark Attendance
                  </ProButton>
                </Link>
                <Link href="/leave/new">
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <Calendar className="w-4 h-4 mr-3" />
                    Request Leave
                  </ProButton>
                </Link>
                <Link href="/payroll">
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <DollarSign className="w-4 h-4 mr-3" />
                    View Payroll
                  </ProButton>
                </Link>
                {user.role !== 'employee' && (
                  <Link href="/reports">
                    <ProButton variant="outline" fullWidth className="justify-start">
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Generate Reports
                    </ProButton>
                  </Link>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>

            {/* Attendance Status */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>Today's Attendance</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                    <UserCheck className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isCheckedIn ? `Since ${formatTime(new Date())}` : 'Please check in to start your day'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <ProButton
                      onClick={handleCheckIn}
                      disabled={isCheckedIn}
                      fullWidth
                      variant={isCheckedIn ? 'secondary' : 'success'}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {isCheckedIn ? 'Already Checked In' : 'Check In'}
                    </ProButton>
                    <ProButton
                      onClick={handleCheckOut}
                      disabled={!isCheckedIn}
                      fullWidth
                      variant={!isCheckedIn ? 'secondary' : 'danger'}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {isCheckedIn ? 'Check Out' : 'Not Checked In'}
                    </ProButton>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
