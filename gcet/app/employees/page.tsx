'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Mail,
  Phone,
  Building,
  Calendar,
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui';
import { Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import { SmartInput } from '@/components/ui/smart-input';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  status: 'active' | 'inactive' | 'on_leave';
  profilePictureUrl?: string;
  dateOfJoining?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const departments = [
    'all',
    'Engineering',
    'HR',
    'Sales',
    'Marketing',
    'Finance',
    'Operations'
  ];

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let filtered = employees;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, selectedDepartment]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/users/${employeeId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchEmployees();
        }
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading employees...</p>
          </div>
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
            <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your team members and their information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ProButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </ProButton>
            <Link href="/employees/new">
              <ProButton>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </ProButton>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{employees.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {employees.filter(emp => emp.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {employees.filter(emp => emp.status === 'on_leave').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {[...new Set(employees.map(emp => emp.department).filter(Boolean))].length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Filters and Search */}
        <EnterpriseCard>
          <EnterpriseCardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <SmartInput
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    className="pl-10"
                  />
                </div>
                
                <Input
                  placeholder="Employee ID..."
                  className="max-w-xs"
                />
                
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <ProButton
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </ProButton>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Locations</option>
                    <option>Head Office</option>
                    <option>Branch Office</option>
                  </select>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Joining Date"
                  />
                </div>
              </div>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Employees Table */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <div className="flex items-center justify-between">
              <EnterpriseCardTitle>Employee List ({filteredEmployees.length})</EnterpriseCardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </span>
              </div>
            </div>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="p-0">
            {filteredEmployees.length === 0 ? (
              <DataTableEmpty
                title="No employees found"
                description={searchQuery || selectedDepartment !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first employee'
                }
                icon={<Plus className="w-16 h-16 text-gray-400" />}
                action={!searchQuery && selectedDepartment === 'all' && (
                  <Link href="/employees/new">
                    <ProButton>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Your First Employee
                    </ProButton>
                  </Link>
                )}
              />
            ) : (
              <DataTable>
                <DataTableHeader>
                  <DataTableHeaderCell>Employee</DataTableHeaderCell>
                  <DataTableHeaderCell>Department</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Join Date</DataTableHeaderCell>
                  <DataTableHeaderCell>Contact</DataTableHeaderCell>
                  <DataTableHeaderCell>Actions</DataTableHeaderCell>
                </DataTableHeader>
                <DataTableBody>
                  {filteredEmployees.map((employee) => (
                    <DataTableRow
                      key={employee.id}
                      hover
                      className="cursor-pointer"
                      onClick={() => router.push(`/employees/${employee.id}`)}
                    >
                      <DataTableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            {employee.profilePictureUrl ? (
                              <Image
                                src={employee.profilePictureUrl}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.jobTitle || 'Employee'}</div>
                            <div className="text-xs text-gray-400">ID: {employee.employeeId || 'N/A'}</div>
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">{employee.department || 'N/A'}</div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge 
                          variant={employee.status === 'active' ? 'success' : employee.status === 'on_leave' ? 'warning' : 'danger'}
                        >
                          {employee.status === 'active' ? 'Active' : employee.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {employee.dateOfJoining ? formatDate(employee.dateOfJoining) : 'N/A'}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/employees/${employee.id}`}>
                            <ProButton variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </ProButton>
                          </Link>
                          <ProButton
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employee.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </ProButton>
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
