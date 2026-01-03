'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Users, 
  Calendar, 
  Edit, 
  Briefcase,
  MapPin,
  FileText,
  DollarSign,
  Shield,
  UserCircle,
  Award,
  BookOpen
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import { useToastListener } from '@/hooks/useToastListener';

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  dateOfJoining?: string;
  nationality?: string;
  personalEmail?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    panNumber: string;
    uanNumber: string;
    empCode: string;
  };
  salaryStructure?: {
    baseSalary: number;
    basicPercentage: number;
    hraPercentage: number;
    standardAllowance: number;
    performanceBonusPercentage: number;
    ltaPercentage: number;
    pfEmployeeRate: number;
    pfEmployerRate: number;
    professionalTax: number;
  };
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [isEditing, setIsEditing] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  
  // Initialize toast listener
  useToastListener();

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      }
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleProfilePictureUpload = async (file: File, fileType: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'profile_picture');
      formData.append('fileName', fileName);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await response.json();
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Profile Picture Updated',
            message: 'Your profile picture has been successfully updated.',
            type: 'success'
          }
        }));
        
        // Refresh employee data to show new profile picture
        fetchEmployee();
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Upload Failed',
          message: 'Failed to upload profile picture. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const handleDocumentUpload = async (file: File, fileType: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('fileName', fileName);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await response.json();
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Document Uploaded',
            message: 'Your document has been successfully uploaded.',
            type: 'success'
          }
        }));
        
        // Refresh documents list
        setRefreshDocuments(prev => prev + 1);
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Upload Failed',
          message: 'Failed to upload document. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading employee profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-900">Employee not found</p>
            <p className="text-sm text-gray-500 mt-1">The employee profile you're looking for doesn't exist.</p>
            <Link href="/dashboard">
              <ProButton className="mt-4">
                Back to Dashboard
              </ProButton>
            </Link>
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
            <h1 className="text-2xl font-semibold text-gray-900">Employee Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage employee information and documents
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/employees">
              <ProButton variant="outline">
                Back to Employees
              </ProButton>
            </Link>
            <ProButton
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </ProButton>
          </div>
        </div>

        {/* Profile Header Card */}
        <EnterpriseCard>
          <EnterpriseCardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {employee.profilePictureUrl ? (
                      <Image
                        src={employee.profilePictureUrl}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <StatusBadge variant="success">Active</StatusBadge>
                </div>
                <p className="text-lg text-gray-600 mb-1">{employee.jobTitle || 'Employee'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {employee.department || 'Not assigned'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Employee ID: {employee.employeeId || 'Not provided'}
                  </span>
                </div>
                
                {/* Contact Info */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {employee.email}
                  </div>
                  {employee.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {employee.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </Layout>
  );
}
