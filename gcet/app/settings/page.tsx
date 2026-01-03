'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Settings, 
  User, 
  Building, 
  Upload, 
  Shield,
  Bell,
  Mail,
  Globe,
  Database,
  Users,
  CreditCard,
  Lock,
  Phone
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import { SmartInput } from '@/components/ui/smart-input';
import { StatusBadge } from '@/components/ui';
import FileUpload from '@/components/FileUpload';
import { LoadingSpinner } from '@/components/ui';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  profilePictureUrl?: string;
}

interface CompanySettings {
  logoUrl?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Dayflow HRMS',
    companyAddress: '123 Business Street, Suite 100, City, State 12345',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'info@dayflow.com',
    logoUrl: '/logo.png'
  });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

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
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogoUpload = async (file: File, fileType: string, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'company_logo');
      formData.append('fileName', fileName);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Trigger toast event
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            title: 'Logo Updated',
            message: 'Company logo has been successfully updated.',
            type: 'success'
          }
        }));
        
        // Update company settings with new logo URL
        setCompanySettings(prev => ({
          ...prev,
          logoUrl: result.fileUrl
        }));
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          title: 'Upload Failed',
          message: 'Failed to upload logo. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      // Error handling without console.log
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
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
        {/* Header with Search */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account and system preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <ProButton
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Settings'}
            </ProButton>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gray-600" />
                  <EnterpriseCardTitle>Company Information</EnterpriseCardTitle>
                </div>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="space-y-6">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                        {companySettings.logoUrl ? (
                          <Image
                            src={companySettings.logoUrl}
                            alt="Company Logo"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        {isEditing && (
                          <div className="flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <FileUpload
                              onUploadAction={handleLogoUpload}
                              fileType="company_logo"
                              label="Upload Company Logo"
                              acceptedTypes={['image/*']}
                              currentFile={companySettings.logoUrl}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SmartInput
                      label="Company Name"
                      value={companySettings.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings(prev => ({ ...prev, companyName: e.target.value }))}
                      disabled={!isEditing}
                      leftIcon={<Building className="w-4 h-4 text-gray-400" />}
                    />
                    
                    <SmartInput
                      label="Company Email"
                      type="email"
                      value={companySettings.companyEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                      disabled={!isEditing}
                      leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                    
                    <SmartInput
                      label="Company Phone"
                      type="tel"
                      value={companySettings.companyPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                      disabled={!isEditing}
                      leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Address
                    </label>
                    <textarea
                      value={companySettings.companyAddress}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <ProButton variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </ProButton>
                      <ProButton
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                              title: 'Settings Saved',
                              message: 'Company settings have been successfully updated.',
                              type: 'success'
                            }
                          }));
                          setIsEditing(false);
                        }}
                      >
                        Save Changes
                      </ProButton>
                    </div>
                  )}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>

            {/* System Settings */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <EnterpriseCardTitle>System Settings</EnterpriseCardTitle>
                </div>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Language</p>
                        <p className="text-xs text-gray-500">Select your preferred language</p>
                      </div>
                    </div>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data Export</p>
                        <p className="text-xs text-gray-500">Export all company data</p>
                      </div>
                    </div>
                    <ProButton variant="outline" size="sm">
                      Export Data
                    </ProButton>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Security</p>
                        <p className="text-xs text-gray-500">Manage security settings</p>
                      </div>
                    </div>
                    <ProButton variant="outline" size="sm">
                      Configure
                    </ProButton>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>Quick Actions</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="space-y-3">
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </ProButton>
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing Settings
                  </ProButton>
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Preferences
                  </ProButton>
                  <ProButton variant="outline" fullWidth className="justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Password Settings
                  </ProButton>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>

            {/* Account Info */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>Account Information</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profilePictureUrl ? (
                        <Image
                          src={user.profilePictureUrl}
                          alt={user.firstName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <StatusBadge variant="primary" className="mt-1">
                        {user.role}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link href="/employees/[id]">
                      <ProButton variant="ghost" size="sm" fullWidth>
                        View Profile
                      </ProButton>
                    </Link>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>

            {/* System Status */}
            <EnterpriseCard>
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>System Status</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <StatusBadge variant="success">Online</StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <StatusBadge variant="success">Connected</StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-xs text-gray-500">2.3 GB / 10 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version</span>
                    <span className="text-xs text-gray-500">v2.1.0</span>
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
