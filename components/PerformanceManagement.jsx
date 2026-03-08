'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, User, CheckCircle, Clock, AlertCircle, Plus, Edit, Eye } from 'lucide-react';

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      
      const response = await fetch(`/api/performance?${params}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status })
      });

      if (response.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, status } : r
        ));
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'DRAFT': <Edit className="w-4 h-4" />,
      'SUBMITTED': <Clock className="w-4 h-4" />,
      'APPROVED': <CheckCircle className="w-4 h-4" />,
      'REJECTED': <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{review.user.name}</h3>
            <p className="text-sm text-gray-500">{review.user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(review.status)}`}>
            {getStatusIcon(review.status)}
            <span>{review.status}</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Review Period</span>
          <span className="text-sm text-gray-900">{review.reviewPeriod}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Review Type</span>
          <span className="text-sm text-gray-900">{review.reviewType}</span>
        </div>

        {review.overallRating && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Rating</span>
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(review.overallRating)}</div>
              <span className="text-sm font-medium text-gray-900">
                {review.overallRating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {review.strengths && (
          <div>
            <span className="text-sm font-medium text-gray-700">Strengths</span>
            <p className="text-sm text-gray-600 mt-1">{review.strengths}</p>
          </div>
        )}

        {review.weaknesses && (
          <div>
            <span className="text-sm font-medium text-gray-700">Areas for Improvement</span>
            <p className="text-sm text-gray-600 mt-1">{review.weaknesses}</p>
          </div>
        )}

        {review.goals && (
          <div>
            <span className="text-sm font-medium text-gray-700">Goals</span>
            <p className="text-sm text-gray-600 mt-1">{review.goals}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Created: {new Date(review.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedReview(review)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="w-4 h-4" />
          </button>
          {review.status === 'SUBMITTED' && (
            <>
              <button
                onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                className="text-green-600 hover:text-green-800"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                className="text-red-600 hover:text-red-800"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const CreateReviewModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      userId: '',
      reviewPeriod: '',
      reviewType: 'QUARTERLY',
      qualityRating: 3,
      quantityRating: 3,
      teamworkRating: 3,
      initiativeRating: 3,
      attendanceRating: 3,
      strengths: '',
      weaknesses: '',
      goals: '',
      recommendations: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const RatingInput = ({ label, value, onChange }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
        </div>
      </div>
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-25" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Performance Review</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {/* Add employee options here */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Period
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reviewPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Q1-2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Type
                </label>
                <select
                  value={formData.reviewType}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="PROBATION">Probation</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Performance Ratings (1-5 scale)</h4>
                <RatingInput
                  label="Quality of Work"
                  value={formData.qualityRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, qualityRating: value }))}
                />
                <RatingInput
                  label="Quantity of Work"
                  value={formData.quantityRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, quantityRating: value }))}
                />
                <RatingInput
                  label="Teamwork"
                  value={formData.teamworkRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, teamworkRating: value }))}
                />
                <RatingInput
                  label="Initiative"
                  value={formData.initiativeRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, initiativeRating: value }))}
                />
                <RatingInput
                  label="Attendance"
                  value={formData.attendanceRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, attendanceRating: value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths
                </label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the employee's strengths..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  value={formData.weaknesses}
                  onChange={(e) => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe areas where the employee can improve..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Set goals for the next review period..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendations
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide recommendations for growth..."
                />
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
                  Create Review
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Manage employee performance reviews and ratings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
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
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(status => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                {getStatusIcon(status)}
                <span>{status}</span>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {reviews.filter(r => r.status === status).length}
                </span>
              </h3>
              <div className="space-y-3">
                {reviews
                  .filter(review => review.status === status)
                  .map(review => (
                    <div key={review.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{review.user.name}</span>
                        {review.overallRating && (
                          <div className="flex">{renderStars(review.overallRating)}</div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{review.reviewPeriod}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Review Modal */}
      <CreateReviewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createReview}
      />
    </div>
  );
}
