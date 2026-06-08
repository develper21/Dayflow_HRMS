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
      'DRAFT': 'bg-gray-200 text-black border-2 border-black',
      'SUBMITTED': 'bg-yellow-400 text-black border-2 border-black',
      'APPROVED': 'bg-green-500 text-white border-2 border-black',
      'REJECTED': 'bg-red-500 text-white border-2 border-black'
    };
    return colors[status] || 'bg-gray-200 text-black border-2 border-black';
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
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-6 hover:shadow-[6px_6px_0_0_#000] transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-blue-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest">{review.user.name}</h3>
            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{review.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(review.status)}`}>
            {getStatusIcon(review.status)}
            <span>{review.status}</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-black pb-2">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">REVIEW_PERIOD</span>
          <span className="text-[10px] font-black text-black uppercase tracking-widest">{review.reviewPeriod}</span>
        </div>

        <div className="flex items-center justify-between border-b border-black pb-2">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">REVIEW_TYPE</span>
          <span className="text-[10px] font-black text-black uppercase tracking-widest">{review.reviewType}</span>
        </div>

        {review.overallRating && (
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">OVERALL_RATING</span>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(review.overallRating)}</div>
              <span className="text-[10px] font-black text-black font-mono uppercase">
                {review.overallRating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {review.strengths && (
          <div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono block mb-1">STRENGTHS</span>
            <p className="text-[10px] text-black font-mono uppercase tracking-wider">{review.strengths}</p>
          </div>
        )}

        {review.weaknesses && (
          <div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono block mb-1">AREAS_FOR_IMPROVEMENT</span>
            <p className="text-[10px] text-black font-mono uppercase tracking-wider">{review.weaknesses}</p>
          </div>
        )}

        {review.goals && (
          <div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono block mb-1">GOALS</span>
            <p className="text-[10px] text-black font-mono uppercase tracking-wider">{review.goals}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-black">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
          CREATED: {new Date(review.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedReview(review)}
            className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          {review.status === 'SUBMITTED' && (
            <>
              <button
                onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                className="p-2 border-2 border-black bg-green-500 text-white hover:bg-green-600 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-all"
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
        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">{label}</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 border-2 border-black"
          />
          <span className="text-[10px] font-black text-black font-mono uppercase w-8">{value}</span>
        </div>
      </div>
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>

          <div className="relative bg-white border-[3px] border-black shadow-[16px_16px_0_0_#000] w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">PERFORMANCE_REVIEW_PROTOCOL</h3>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight italic mb-8">Create New Review</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    EMPLOYEE
                  </label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                  >
                    <option value="">SELECT_EMPLOYEE</option>
                    {/* Add employee options here */}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                    REVIEW_PERIOD
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reviewPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono placeholder:text-gray-300"
                    placeholder="E.G., Q1-2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  REVIEW_TYPE
                </label>
                <select
                  value={formData.reviewType}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none font-mono"
                >
                  <option value="QUARTERLY">QUARTERLY</option>
                  <option value="ANNUAL">ANNUAL</option>
                  <option value="PROBATION">PROBATION</option>
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest font-mono">PERFORMANCE_RATINGS (1-5_SCALE)</h4>
                <RatingInput
                  label="QUALITY_OF_WORK"
                  value={formData.qualityRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, qualityRating: value }))}
                />
                <RatingInput
                  label="QUANTITY_OF_WORK"
                  value={formData.quantityRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, quantityRating: value }))}
                />
                <RatingInput
                  label="TEAMWORK"
                  value={formData.teamworkRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, teamworkRating: value }))}
                />
                <RatingInput
                  label="INITIATIVE"
                  value={formData.initiativeRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, initiativeRating: value }))}
                />
                <RatingInput
                  label="ATTENDANCE"
                  value={formData.attendanceRating}
                  onChange={(value) => setFormData(prev => ({ ...prev, attendanceRating: value }))}
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  STRENGTHS
                </label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-mono uppercase tracking-wider bg-white outline-none placeholder:text-gray-300"
                  placeholder="DESCRIBE_THE_EMPLOYEE'S_STRENGTHS..."
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  AREAS_FOR_IMPROVEMENT
                </label>
                <textarea
                  value={formData.weaknesses}
                  onChange={(e) => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-mono uppercase tracking-wider bg-white outline-none placeholder:text-gray-300"
                  placeholder="DESCRIBE_AREAS_WHERE_THE_EMPLOYEE_CAN_IMPROVE..."
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  GOALS
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-mono uppercase tracking-wider bg-white outline-none placeholder:text-gray-300"
                  placeholder="SET_GOALS_FOR_THE_NEXT_REVIEW_PERIOD..."
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                  RECOMMENDATIONS
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-mono uppercase tracking-wider bg-white outline-none placeholder:text-gray-300"
                  placeholder="PROVIDE_RECOMMENDATIONS_FOR_GROWTH..."
                />
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
                  CREATE_REVIEW
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
          <h2 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">PERFORMANCE_MANAGEMENT_MODULE</h2>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight italic underline underline-offset-8 decoration-4 decoration-blue-500">Performance Management</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-3 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE_NEW_REVIEW</span>
        </button>
      </div>

      {/* Filters */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none cursor-pointer font-mono"
            >
              <option value="all">ALL_STATUS</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-black ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              LIST_VIEW
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-black ${viewMode === 'kanban' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              KANBAN_VIEW
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
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
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(status => (
            <div key={status} className="border-2 border-black bg-gray-50 p-6 shadow-[4px_4px_0_0_#000]">
              <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                {getStatusIcon(status)}
                <span>{status}</span>
                <span className="border-2 border-black bg-white text-black text-[8px] px-2 py-1 font-black uppercase tracking-widest">
                  {reviews.filter(r => r.status === status).length}
                </span>
              </h3>
              <div className="space-y-4">
                {reviews
                  .filter(review => review.status === status)
                  .map(review => (
                    <div key={review.id} className="border-2 border-black bg-white p-4 shadow-[2px_2px_0_0_#000]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">{review.user.name}</span>
                        {review.overallRating && (
                          <div className="flex">{renderStars(review.overallRating)}</div>
                        )}
                      </div>
                      <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{review.reviewPeriod}</p>
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
