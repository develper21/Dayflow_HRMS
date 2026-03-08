'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, CheckCircle, PlayCircle, Award, Plus, Edit, Eye, Search, Filter } from 'lucide-react';

export default function TrainingManagement() {
  const [trainings, setTrainings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('trainings'); // 'trainings' or 'enrollments'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterStatus, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(activeTab === 'enrollments' && { enrollments: 'true' })
      });
      
      const response = await fetch(`/api/training?${params}`);
      const data = await response.json();
      
      if (activeTab === 'enrollments') {
        setEnrollments(data.enrollments || []);
      } else {
        setTrainings(data.trainings || []);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTraining = async (trainingData) => {
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...trainingData })
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating training:', error);
    }
  };

  const enrollInTraining = async (trainingId) => {
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enroll', trainingId })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error enrolling in training:', error);
    }
  };

  const updateProgress = async (enrollmentId, progress, status) => {
    try {
      const response = await fetch('/api/training', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_progress', id: enrollmentId, progress, status })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLANNED': 'bg-blue-100 text-blue-800',
      'ONGOING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'ENROLLED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'DROPPED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'TECHNICAL': <BookOpen className="w-4 h-4" />,
      'SOFT_SKILLS': <Users className="w-4 h-4" />,
      'COMPLIANCE': <CheckCircle className="w-4 h-4" />,
      'SAFETY': <Award className="w-4 h-4" />
    };
    return icons[category] || <BookOpen className="w-4 h-4" />;
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.training.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const TrainingCard = ({ training, isEnrollment = false }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {getCategoryIcon(training.category)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{training.title}</h3>
            <p className="text-sm text-gray-500">{training.category}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(training.status)}`}>
          {training.status}
        </span>
      </div>

      <div className="space-y-3">
        {training.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{training.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {training.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{training.duration} hours</span>
            </div>
          )}
          {training.cost && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">${training.cost}</span>
            </div>
          )}
          {training.instructor && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{training.instructor}</span>
            </div>
          )}
          {training.startDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {new Date(training.startDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {isEnrollment && training.progress !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{training.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${training.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {!isEnrollment && training.enrollments && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{training.enrollments.length} enrolled</span>
            <span>{training.enrollments.filter(e => e.status === 'COMPLETED').length} completed</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Created: {new Date(training.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 hover:text-blue-800">
            <Eye className="w-4 h-4" />
          </button>
          {!isEnrollment && training.status === 'PLANNED' && (
            <button
              onClick={() => enrollInTraining(training.id)}
              className="text-green-600 hover:text-green-800"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {isEnrollment && training.status === 'ENROLLED' && (
            <button
              onClick={() => updateProgress(training.id, Math.min(100, training.progress + 10), 'IN_PROGRESS')}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const CreateTrainingModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'TECHNICAL',
      duration: '',
      cost: '',
      instructor: '',
      startDate: '',
      endDate: '',
      status: 'PLANNED'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-25" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Training</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="SOFT_SKILLS">Soft Skills</option>
                    <option value="COMPLIANCE">Compliance</option>
                    <option value="SAFETY">Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Training
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600 mt-1">Manage employee training programs and enrollments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Training</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('trainings')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'trainings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training Programs
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Enrollments
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {activeTab === 'trainings' && (
              <>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="SOFT_SKILLS">Soft Skills</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="SAFETY">Safety</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="PLANNED">Planned</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'trainings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map(enrollment => (
                <TrainingCard key={enrollment.id} training={enrollment} isEnrollment={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Training Modal */}
      <CreateTrainingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createTraining}
      />
    </div>
  );
}
