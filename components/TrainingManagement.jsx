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
      'PLANNED': 'bg-blue-500 text-white border-2 border-black',
      'ONGOING': 'bg-yellow-400 text-black border-2 border-black',
      'COMPLETED': 'bg-green-500 text-white border-2 border-black',
      'CANCELLED': 'bg-red-500 text-white border-2 border-black',
      'ENROLLED': 'bg-blue-500 text-white border-2 border-black',
      'IN_PROGRESS': 'bg-yellow-400 text-black border-2 border-black',
      'DROPPED': 'bg-red-500 text-white border-2 border-black'
    };
    return colors[status] || 'bg-gray-200 text-black border-2 border-black';
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
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-6 hover:shadow-[6px_6px_0_0_#000] transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-blue-500 flex items-center justify-center">
            {getCategoryIcon(training.category)}
          </div>
          <div>
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest">{training.title}</h3>
            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{training.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${getStatusColor(training.status)}`}>
          {training.status}
        </span>
      </div>

      <div className="space-y-4">
        {training.description && (
          <p className="text-[10px] text-black font-mono uppercase tracking-wider line-clamp-2">{training.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-[10px]">
          {training.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-black font-mono uppercase">{training.duration} HOURS</span>
            </div>
          )}
          {training.cost && (
            <div className="flex items-center gap-2">
              <span className="text-black font-mono uppercase">${training.cost}</span>
            </div>
          )}
          {training.instructor && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-black font-mono uppercase">{training.instructor}</span>
            </div>
          )}
          {training.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-black font-mono uppercase">
                {new Date(training.startDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {isEnrollment && training.progress !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">PROGRESS</span>
              <span className="text-[10px] font-black text-black font-mono uppercase">{training.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 border-2 border-black h-4">
              <div
                className="bg-blue-600 h-2 mt-0.5"
                style={{ width: `${training.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {!isEnrollment && training.enrollments && (
          <div className="flex items-center justify-between text-[10px] text-black font-mono uppercase">
            <span>{training.enrollments.length} ENROLLED</span>
            <span>{training.enrollments.filter(e => e.status === 'COMPLETED').length} COMPLETED</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-black">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
          CREATED: {new Date(training.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <button className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all">
            <Eye className="w-4 h-4" />
          </button>
          {!isEnrollment && training.status === 'PLANNED' && (
            <button
              onClick={() => enrollInTraining(training.id)}
              className="p-2 border-2 border-black bg-green-500 text-white hover:bg-green-600 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {isEnrollment && training.status === 'ENROLLED' && (
            <button
              onClick={() => updateProgress(training.id, Math.min(100, training.progress + 10), 'IN_PROGRESS')}
              className="p-2 border-2 border-black bg-yellow-400 text-black hover:bg-yellow-500 transition-all"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>

          <div className="relative bg-white border-[3px] border-black shadow-[16px_16px_0_0_#000] w-full max-w-md p-10">
            <h3 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">TRAINING_CREATION_PROTOCOL</h3>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight italic mb-8">Create New Training</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  TRAINING_TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-mono uppercase tracking-wider bg-white outline-none placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="SOFT_SKILLS">SOFT_SKILLS</option>
                    <option value="COMPLIANCE">COMPLIANCE</option>
                    <option value="SAFETY">SAFETY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    DURATION (HOURS)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    COST ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    INSTRUCTOR
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    START_DATE
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    END_DATE
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black border-2 border-black bg-white hover:bg-gray-100 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
                >
                  CREATE_TRAINING
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">TRAINING_MANAGEMENT_MODULE</h2>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight italic underline underline-offset-8 decoration-4 decoration-blue-500">Training Dashboard</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-3 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE_NEW_TRAINING</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
        <div className="border-b-2 border-black">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('trainings')}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 ${
                activeTab === 'trainings'
                  ? 'border-black bg-black text-white'
                  : 'border-transparent text-black hover:bg-gray-100'
              }`}
            >
              TRAINING_PROGRAMS
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 ${
                activeTab === 'enrollments'
                  ? 'border-black bg-black text-white'
                  : 'border-transparent text-black hover:bg-gray-100'
              }`}
            >
              MY_ENROLLMENTS
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="SEARCH_TRAININGS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono placeholder:text-gray-300"
                />
              </div>
            </div>

            {activeTab === 'trainings' && (
              <>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none cursor-pointer font-mono"
                >
                  <option value="all">ALL_CATEGORIES</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="SOFT_SKILLS">SOFT_SKILLS</option>
                  <option value="COMPLIANCE">COMPLIANCE</option>
                  <option value="SAFETY">SAFETY</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none cursor-pointer font-mono"
                >
                  <option value="all">ALL_STATUS</option>
                  <option value="PLANNED">PLANNED</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 border-2 border-black w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 border-2 border-black w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 border-2 border-black"></div>
                      <div className="h-3 bg-gray-200 border-2 border-black w-5/6"></div>
                      <div className="h-3 bg-gray-200 border-2 border-black w-4/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'trainings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
