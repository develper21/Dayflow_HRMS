'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Trash2, Eye, Calendar, Filter, Plus, Search } from 'lucide-react';

export default function ReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { type: filterType })
      });
      
      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const downloadReport = (report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'GENERATING': 'bg-yellow-100 text-yellow-800 border border-black',
      'COMPLETED': 'bg-green-100 text-green-800 border border-black',
      'FAILED': 'bg-red-100 text-red-800 border border-black'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-black';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'ATTENDANCE': <Calendar className="w-4 h-4" />,
      'PAYROLL': <FileText className="w-4 h-4" />,
      'LEAVE': <FileText className="w-4 h-4" />,
      'PERFORMANCE': <FileText className="w-4 h-4" />,
      'EMPLOYEE': <FileText className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const CreateReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'ATTENDANCE',
      format: 'PDF',
      parameters: {}
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
          
          <div className="relative bg-white border-[3px] border-black shadow-[16px_16px_0_0_#000] max-w-md w-full p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic mb-2">REPORT_GENERATION_PROTOCOL</h3>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight italic">INITIATE_NEW_REPORT</h2>
              </div>
              <button onClick={onClose} className="text-3xl font-black text-black hover:text-red-600 transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">REPORT_DESIGNATION</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                  placeholder="ENTER_REPORT_NAME"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">DATA_SOURCE_CLASSIFICATION</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono bg-white"
                >
                  <option value="ATTENDANCE">ATTENDANCE_DATA</option>
                  <option value="PAYROLL">FINANCIAL_PAYROLL</option>
                  <option value="LEAVE">ABSENCE_REGISTRY</option>
                  <option value="PERFORMANCE">PERFORMANCE_METRICS</option>
                  <option value="EMPLOYEE">ENTITY_DATABASE</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">OUTPUT_FORMAT</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono bg-white"
                >
                  <option value="PDF">PORTABLE_DOCUMENT</option>
                  <option value="EXCEL">SPREADSHEET_XLSX</option>
                  <option value="CSV">DELIMITED_CSV</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2 block">TEMPORAL_RANGE</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, startDate: e.target.value }
                    }))}
                    className="px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                  />
                  <input
                    type="date"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, endDate: e.target.value }
                    }))}
                    className="px-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none focus:bg-gray-50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black hover:bg-gray-100 transition-all shadow-[4px_4px_0_0_#000] active:shadow-none"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black hover:bg-gray-900 transition-all shadow-[4px_4px_0_0_#000] active:shadow-none"
                >
                  EXECUTE_GENERATION
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
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic mb-2">DATA_EXTRACTION_MODULE</h2>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight italic underline underline-offset-8 decoration-4 decoration-blue-500">Report Management System</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all flex items-center gap-3 active:translate-x-1 active:translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>INITIATE_NEW_REPORT</span>
        </button>
      </div>

      {/* Filters */}
      <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-black w-5 h-5" />
              <input
                type="text"
                placeholder="SCANNING_REPORT_DATABASE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-black text-[10px] font-black uppercase outline-none italic placeholder:text-gray-300 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none transition-all font-mono tracking-widest"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase outline-none bg-white font-mono tracking-widest cursor-pointer"
          >
            <option value="all">ALL_CLASSIFICATIONS</option>
            <option value="ATTENDANCE">ATTENDANCE_DATA</option>
            <option value="PAYROLL">FINANCIAL_PAYROLL</option>
            <option value="LEAVE">ABSENCE_REGISTRY</option>
            <option value="PERFORMANCE">PERFORMANCE_METRICS</option>
            <option value="EMPLOYEE">ENTITY_DATABASE</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase outline-none bg-white font-mono tracking-widest cursor-pointer"
          >
            <option value="all">ALL_STATUS_STATES</option>
            <option value="GENERATING">GENERATING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono animate-pulse">EXTRACTING_REPORT_DATA...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono italic">ZERO_REPORTS_DETECTED</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20 italic">REPORT_DESIGNATION</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">CLASSIFICATION</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">FORMAT</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">PROTOCOL_STATUS</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">GENERATION_TIMESTAMP</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest border-r border-white/20">FILE_SIZE</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-center italic">EXECUTIVE_ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-mono">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 border-r border-black">
                      <div className="flex items-center gap-3">
                        <div className="text-black">{getTypeIcon(report.type)}</div>
                        <div>
                          <p className="text-sm font-black text-black italic">{report.name}</p>
                          <p className="text-[8px] font-mono text-gray-400 uppercase">ID: {report.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-r border-black font-black uppercase tracking-widest">{report.type}</td>
                    <td className="px-8 py-5 border-r border-black font-black uppercase tracking-widest">{report.format}</td>
                    <td className="px-8 py-5 border-r border-black">
                      <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0_0_#000] ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 border-r border-black font-mono font-bold text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 border-r border-black font-mono font-bold text-gray-500">
                      {report.fileSize ? `${(report.fileSize / 1024).toFixed(1)} KB` : '-'}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {report.status === 'COMPLETED' && report.fileUrl && (
                          <button
                            onClick={() => downloadReport(report)}
                            className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:shadow-none"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        {report.status === 'FAILED' && (
                          <button
                            onClick={() => {/* Retry logic */}}
                            className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-yellow-400 transition-all shadow-[2px_2px_0_0_#000] active:shadow-none"
                            title="Retry"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:shadow-none"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createReport}
      />
    </div>
  );
}
