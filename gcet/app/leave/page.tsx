'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Download, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Clock,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui';
import { Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import { SmartInput } from '@/components/ui/smart-input';
import { useToastListener } from '@/hooks/useToastListener';

interface LeaveRequest {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  leaveType: 'paid' | 'sick' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approverComments?: string;
}

export default function LeavePage() {
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Initialize toast listener
  useToastListener();

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/leaves');
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleExportLeave = async () => {
    try {
      const params = new URLSearchParams();
      const response = await fetch(`/api/export/leave?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a') as HTMLAnchorElement;
        link.href = url;
        link.download = `leave_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = leaveRequests.filter(request =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading leave requests...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage employee time-off requests and approvals
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ProButton variant="outline" onClick={handleExportLeave}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </ProButton>
            <Link href="/leave/new">
              <ProButton>
                <Plus className="w-4 h-4 mr-2" />
                New Request
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
                  <p className="text-sm font-medium text-gray-600">Paid Time Off</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">24 Days</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Available</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sick Leave</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">7 Days</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">Available</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-semibold text-orange-600 mt-1">
                    {leaveRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Need approval</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-semibold text-purple-600 mt-1">{leaveRequests.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Users className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600">This month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
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
                  placeholder="Search leave requests..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  className="max-w-md"
                />
                
                <Input
                  placeholder="Employee name..."
                  className="max-w-xs"
                />
                
                <Input
                  type="date"
                  placeholder="Start date..."
                  className="max-w-xs"
                />
                
                <Input
                  type="date"
                  placeholder="End date..."
                  className="max-w-xs"
                />
                
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Types</option>
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <ProButton variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </ProButton>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Leave Requests Table */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <div className="flex items-center justify-between">
              <EnterpriseCardTitle>
                Leave Requests ({filteredRequests.length})
              </EnterpriseCardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing all requests
                </span>
              </div>
            </div>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <DataTableEmpty
                title="No leave requests"
                description={searchQuery ? 'Try adjusting your search criteria' : 'No leave requests found at the moment.'}
                icon={<Calendar className="w-16 h-16 text-gray-400" />}
                action={!searchQuery && (
                  <Link href="/leave/new">
                    <ProButton>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Request
                    </ProButton>
                  </Link>
                )}
              />
            ) : (
              <DataTable>
                <DataTableHeader>
                  <DataTableHeaderCell>Employee</DataTableHeaderCell>
                  <DataTableHeaderCell>Leave Type</DataTableHeaderCell>
                  <DataTableHeaderCell>Start Date</DataTableHeaderCell>
                  <DataTableHeaderCell>End Date</DataTableHeaderCell>
                  <DataTableHeaderCell>Duration</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Actions</DataTableHeaderCell>
                </DataTableHeader>
                <DataTableBody>
                  {filteredRequests.map((request) => (
                    <DataTableRow key={request.id} hover>
                      <DataTableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.name}
                            </div>
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge 
                          variant={request.leaveType === 'paid' ? 'success' : request.leaveType === 'sick' ? 'primary' : 'gray'}
                        >
                          {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {formatDate(request.startDate)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {formatDate(request.endDate)}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge 
                          variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}
                        >
                          {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center space-x-2">
                          <ProButton variant="ghost" size="sm">
                            View
                          </ProButton>
                          {request.status === 'pending' && (
                            <>
                              {actionLoading === request.id ? (
                                <div className="flex items-center space-x-2">
                                  <LoadingSpinner />
                                  <span className="text-xs text-gray-500">Processing...</span>
                                </div>
                              ) : (
                                <>
                                  <ProButton 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-green-600"
                                    onClick={() => handleApprove(request.id)}
                                  >
                                    Approve
                                  </ProButton>
                                  <ProButton 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={() => handleReject(request.id)}
                                  >
                                    Reject
                                  </ProButton>
                                </>
                              )}
                            </>
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
