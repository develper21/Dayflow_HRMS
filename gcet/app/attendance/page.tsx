'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Download, 
  Clock,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui';
import { Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/login');
      }
    } catch {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const startDate = new Date(currentTime);
      const endDate = new Date(currentTime);
      
      if (selectedView === 'month') {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
      }

      const params = new URLSearchParams({
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      });

      // Add userId filter for admin view if specific employee is selected
      if (user && (user.role === 'admin' || user.role === 'hr') && selectedEmployee !== 'all') {
        params.set('userId', selectedEmployee);
      }

      // Use the same endpoint for all users, API will handle role-based filtering
      const endpoint = `/api/attendance?${params}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTime, selectedView, user, selectedEmployee]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'hr') {
        fetchEmployees();
      }
      fetchAttendance();
    }
  }, [user, fetchEmployees, fetchAttendance]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentTime);
    if (selectedView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentTime(newDate);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    if (selectedView === 'day') {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const handleExportAttendance = async () => {
    try {
      setActionLoading(true);
      const params = new URLSearchParams();
      
      // Add date range if needed
      if (selectedView === 'month') {
        const startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).toISOString().split('T')[0];
        params.set('from', startDate);
        params.set('to', endDate);
      } else {
        // For day view, use current date
        const currentDate = currentTime.toISOString().split('T')[0];
        params.set('from', currentDate);
        params.set('to', currentDate);
      }
      
      // Add user filter for HR/Admin if specific employee is selected
      if (user && (user.role === 'admin' || user.role === 'hr') && selectedEmployee !== 'all') {
        params.set('userId', selectedEmployee);
      }
      
      // Use the appropriate export endpoint
      const exportEndpoint = `/api/export/attendance?${params.toString()}`;
      
      const response = await fetch(exportEndpoint);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Error handling without console.log
      }
    } catch {
      // Error handling without console.log
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAttendance = async (recordId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recordId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh attendance data
        await fetchAttendance();
        setEditingRecord(null);
        setEditStatus('');
      }
    } catch {
      // Error handling without console.log
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = (record: AttendanceRecord) => {
    setEditingRecord(record.id);
    setEditStatus(record.status);
  };

  const cancelEditing = () => {
    setEditingRecord(null);
    setEditStatus('');
  };

  const saveEdit = (recordId: string) => {
    handleUpdateAttendance(recordId, editStatus);
  };

  const calculateStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const leaves = attendanceRecords.filter(r => r.status === 'leave').length;
    const total = attendanceRecords.length;
    return { present, leaves, total };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading attendance data...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage employee attendance records
            </p>
            {/* Quick Navigation Links */}
            <div className="flex items-center space-x-4 mt-2">
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <span className="text-sm text-gray-400">•</span>
              <Link href="/employees" className="text-sm text-blue-600 hover:text-blue-800">
                Employees
              </Link>
              <span className="text-sm text-gray-400">•</span>
              <Link href="/leave" className="text-sm text-blue-600 hover:text-blue-800">
                Leave Management
              </Link>
              <span className="text-sm text-gray-400">•</span>
              <Link href="/payroll" className="text-sm text-blue-600 hover:text-blue-800">
                Payroll
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ProButton
              onClick={handleExportAttendance}
              loading={actionLoading}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </ProButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Present</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">{stats.present}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Good attendance</span>
                  </div>
                </div>
                <Link href="/attendance/report" className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </Link>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days on Leave</p>
                  <p className="text-2xl font-semibold text-orange-600 mt-1">{stats.leaves}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Approved leaves</span>
                  </div>
                </div>
                <Link href="/leave" className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center hover:bg-orange-200 transition-colors">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </Link>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Working Days</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.total}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">This period</span>
                  </div>
                </div>
                <Link href="/payroll" className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
                  <Clock className="w-6 h-6 text-blue-600" />
                </Link>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-semibold text-purple-600 mt-1">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600">Above target</span>
                  </div>
                </div>
                <Link href="/employees" className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </Link>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Filters and Controls */}
        <EnterpriseCard>
          <EnterpriseCardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
                {/* Search Field */}
                <div className="relative flex-1 max-w-xs">
                  <Input
                    type="text"
                    placeholder="Search attendance records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Employee Selector for Admin/HR */}
                {user.role === 'admin' || user.role === 'hr' ? (
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} {emp.employeeId && `(${emp.employeeId})`}
                      </option>
                    ))}
                  </select>
                ) : null}

                {/* View Selector */}
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value as 'day' | 'month')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="day">Day View</option>
                    <option value="month">Month View</option>
                  </select>
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <ProButton variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </ProButton>
                <div className="px-4 py-2 bg-gray-50 rounded-md min-w-[150px] text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(currentTime)}
                  </span>
                </div>
                <ProButton variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </ProButton>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Attendance Table */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <div className="flex items-center justify-between">
              <EnterpriseCardTitle>
                Attendance Records ({attendanceRecords.length})
              </EnterpriseCardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedEmployee === 'all' ? 'All Employees' : 'Selected Employee'}
                </span>
              </div>
            </div>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="p-0">
            {attendanceRecords.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                <p className="text-sm text-gray-500">
                  No attendance records found for the selected period.
                </p>
              </div>
            ) : (
              <DataTable>
                <DataTableHeader>
                  {user.role === 'admin' || user.role === 'hr' ? <DataTableHeaderCell>Employee</DataTableHeaderCell> : null}
                  <DataTableHeaderCell>Date</DataTableHeaderCell>
                  <DataTableHeaderCell>Check In</DataTableHeaderCell>
                  <DataTableHeaderCell>Check Out</DataTableHeaderCell>
                  <DataTableHeaderCell>Work Hours</DataTableHeaderCell>
                  <DataTableHeaderCell>Extra Hours</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  {(user.role === 'admin' || user.role === 'hr') && <DataTableHeaderCell>Actions</DataTableHeaderCell>}
                </DataTableHeader>
                <DataTableBody>
                  {attendanceRecords.map((record) => (
                    <DataTableRow key={record.id} hover>
                      {user.role === 'admin' || user.role === 'hr' ? (
                        <DataTableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              {record.user ? (
                                <Link href={`/employees/${record.user.id}`}>
                                  <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                                    {record.user.firstName} {record.user.lastName}
                                  </div>
                                </Link>
                              ) : (
                                <div className="text-sm font-medium text-gray-900">
                                  Unknown
                                </div>
                              )}
                              {record.user?.employeeId && (
                                <div className="text-xs text-gray-500">
                                  {record.user.employeeId}
                                </div>
                              )}
                            </div>
                          </div>
                        </DataTableCell>
                      ) : null}
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {formatTime(record.checkIn)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {formatTime(record.checkOut)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {record.workHours}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {record.extraHours}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge 
                          variant={record.status === 'present' ? 'success' : record.status === 'leave' ? 'warning' : 'danger'}
                        >
                          {record.status === 'present' ? 'Present' : record.status === 'leave' ? 'On Leave' : 'Absent'}
                        </StatusBadge>
                      </DataTableCell>
                      {(user.role === 'admin' || user.role === 'hr') && (
                        <DataTableCell>
                          {editingRecord === record.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={actionLoading}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="half_day">Half Day</option>
                                <option value="leave">Leave</option>
                              </select>
                              <ProButton
                                size="sm"
                                variant="ghost"
                                onClick={() => saveEdit(record.id)}
                                loading={actionLoading}
                                disabled={actionLoading}
                              >
                                <Save className="w-4 h-4" />
                              </ProButton>
                              <ProButton
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={actionLoading}
                              >
                                <X className="w-4 h-4" />
                              </ProButton>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <ProButton
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(record)}
                                disabled={actionLoading}
                              >
                                <Edit className="w-4 h-4" />
                              </ProButton>
                            </div>
                          )}
                        </DataTableCell>
                      )}
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
