'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Download, 
  Upload, 
  FileText, 
  Folder,
  Plus,
  Filter,
  Eye,
  Trash2,
  Edit,
  Calendar,
  User,
  File,
  Image,
  FileArchive,
  FileSpreadsheet
} from 'lucide-react';
import Layout from '@/components/ui/layout';
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from '@/components/ui';
import { ProButton } from '@/components/ui';
import DataTable, { DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui';
import { Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import { SmartInput } from '@/components/ui/smart-input';
import FileUpload from '@/components/FileUpload';
import { useToastListener } from '@/hooks/useToastListener';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'archive' | 'other';
  category: 'contract' | 'certificate' | 'resume' | 'policy' | 'report' | 'other';
  description: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize: string;
  downloadUrl: string;
  isShared: boolean;
  tags: string[];
  userId?: string; // Add user ID for role-based filtering
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Initialize toast listener
  useToastListener();

  const fetchUser = async () => {
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
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleDownload = async (documentId: string) => {
    setActionLoading(documentId);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Downloading document ${documentId}`);
    } catch (error) {
      console.error('Failed to download document:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setActionLoading(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const canUploadDocuments = user?.role === 'admin' || user?.role === 'hr';
  const canDeleteDocuments = user?.role === 'admin';
  const canViewAllDocuments = user?.role === 'admin' || user?.role === 'hr';

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'xls':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'img':
        return <Image className="h-4 w-4 text-purple-600" />;
      case 'archive':
        return <FileArchive className="h-4 w-4 text-yellow-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Document Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload, manage, and share your documents securely
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ProButton variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </ProButton>
            {canUploadDocuments && (
            <ProButton onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </ProButton>
          )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">
                    {documents.length}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">All files</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shared</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">
                    {documents.filter(doc => doc.isShared).length}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <User className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Accessible</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-semibold text-purple-600 mt-1">
                    {[...new Set(documents.map(doc => doc.category))].length}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Folder className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600">Organized</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard>
            <EnterpriseCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-semibold text-orange-600 mt-1">
                    {documents.filter(doc => {
                      const uploadDate = new Date(doc.uploadedDate);
                      const now = new Date();
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      return uploadDate >= weekAgo;
                    }).length}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Recent</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Upload Section */}
        {showUploadModal && (
          <EnterpriseCard>
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>Upload New Document</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (Max 10MB)
                </p>
                <FileUpload
                  onUploadAction={(file: File, fileType: string, fileName: string) => {
                    console.log('File uploaded:', file, fileType, fileName);
                    setShowUploadModal(false);
                  }}
                  acceptedTypes={[".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".zip"]}
                  maxSize={10 * 1024 * 1024}
                  fileType="document"
                  label="Upload Document"
                />
                <label htmlFor="file-upload">
                  <ProButton variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </ProButton>
                </label>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}

        {/* Filters */}
        <EnterpriseCard>
          <EnterpriseCardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
                <SmartInput
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  className="max-w-md"
                />
                
                <Input
                  placeholder="Tags..."
                  className="max-w-xs"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="contract">Contracts</option>
                  <option value="certificate">Certificates</option>
                  <option value="resume">Resumes</option>
                  <option value="policy">Policies</option>
                  <option value="report">Reports</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Documents</option>
                  <option value="xls">Spreadsheets</option>
                  <option value="img">Images</option>
                  <option value="archive">Archives</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <ProButton variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </ProButton>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        {/* Documents Table */}
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <div className="flex items-center justify-between">
              <EnterpriseCardTitle>
                Documents ({filteredDocuments.length})
              </EnterpriseCardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </span>
              </div>
            </div>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="p-0">
            {filteredDocuments.length === 0 ? (
              <DataTableEmpty
                title="No documents found"
                description={searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'No documents have been uploaded yet. Start by uploading your first document.'
                }
                icon={<FileText className="w-16 h-16 text-gray-400" />}
                action={!searchQuery && selectedCategory === 'all' && selectedType === 'all' && (
                  <ProButton onClick={() => setShowUploadModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Document
                  </ProButton>
                )}
              />
            ) : (
              <DataTable>
                <DataTableHeader>
                  <DataTableHeaderCell>Document</DataTableHeaderCell>
                  <DataTableHeaderCell>Category</DataTableHeaderCell>
                  <DataTableHeaderCell>Description</DataTableHeaderCell>
                  <DataTableHeaderCell>Uploaded By</DataTableHeaderCell>
                  <DataTableHeaderCell>Date</DataTableHeaderCell>
                  <DataTableHeaderCell>Size</DataTableHeaderCell>
                  <DataTableHeaderCell>Tags</DataTableHeaderCell>
                  <DataTableHeaderCell>Actions</DataTableHeaderCell>
                </DataTableHeader>
                <DataTableBody>
                  {filteredDocuments.map((doc) => (
                    <DataTableRow key={doc.id} hover>
                      <DataTableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            {getFileIcon(doc.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {doc.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doc.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge 
                          variant={doc.category === 'contract' ? 'success' : 
                                  doc.category === 'certificate' ? 'primary' : 
                                  doc.category === 'policy' ? 'warning' : 'gray'}
                        >
                          {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {doc.description}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {doc.uploadedBy}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {new Date(doc.uploadedDate).toLocaleDateString()}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="text-sm text-gray-900">
                          {doc.fileSize}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{doc.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center space-x-2">
                          {actionLoading === doc.id ? (
                            <div className="flex items-center space-x-2">
                              <LoadingSpinner />
                              <span className="text-xs text-gray-500">Processing...</span>
                            </div>
                          ) : (
                            <>
                              <ProButton variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </ProButton>
                              <ProButton 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownload(doc.id)}
                              >
                                <Download className="w-4 h-4" />
                              </ProButton>
                              <ProButton variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </ProButton>
                              {canDeleteDocuments && (
                              <ProButton 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </ProButton>
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
