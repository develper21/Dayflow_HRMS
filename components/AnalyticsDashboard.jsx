'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, Award, Download, Plus } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedModule]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?type=dashboard&period=${timeRange}`);
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-500'
    };

    return (
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] font-mono mb-1">{title}</p>
            <p className="text-3xl font-black text-black font-mono uppercase">{value}</p>
            {trend && (
              <p className={`text-[8px] font-black mt-2 uppercase tracking-widest font-mono ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% FROM_LAST_PERIOD
              </p>
            )}
          </div>
          <div className={`p-3 border-2 border-black ${colorClasses[color] || colorClasses.blue} text-white`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600 font-mono font-black uppercase tracking-widest">LOADING_ANALYTICS_DATA...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-mono font-black uppercase tracking-widest">ERROR: NO_ANALYTICS_DATA_AVAILABLE</p>
      </div>
    );
  }

  // Prepare chart data
  const attendanceData = data.attendance?.attendance ? 
    data.attendance.attendance.reduce((acc, record) => {
      const date = new Date(record.date).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.present += record.status === 'Present' ? 1 : 0;
        existing.absent += record.status === 'Absent' ? 1 : 0;
      } else {
        acc.push({
          date,
          present: record.status === 'Present' ? 1 : 0,
          absent: record.status === 'Absent' ? 1 : 0
        });
      }
      return acc;
    }, []).slice(-7) : [];

  const leaveTypeData = data.leave?.leaveByType ? 
    Object.entries(data.leave.leaveByType).map(([type, days]) => ({
      name: type,
      value: days
    })) : [];

  const departmentData = data.employees?.employeesByDepartment ?
    data.employees.employeesByDepartment.map(item => ({
      name: item.department,
      employees: item._count.department
    })) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em] font-mono italic">DATA_VISUALIZATION_MODULE</h2>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight italic underline underline-offset-8 decoration-4 decoration-blue-500">Analytics Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-6 py-3 border-2 border-black text-[10px] font-black uppercase tracking-widest bg-white outline-none cursor-pointer font-mono"
          >
            <option value="weekly">LAST_WEEK</option>
            <option value="monthly">LAST_MONTH</option>
            <option value="quarterly">LAST_QUARTER</option>
            <option value="yearly">LAST_YEAR</option>
          </select>
          <button className="flex items-center gap-3 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[6px_6px_0_0_#0064ff] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1">
            <Download className="w-5 h-5" />
            <span>EXPORT_DATA</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL_EMPLOYEES"
          value={data.employees?.totalEmployees || 0}
          icon={Users}
          trend={5.2}
          color="blue"
        />
        <StatCard
          title="ATTENDANCE_RATE"
          value={`${data.attendance?.attendanceRate || 0}%`}
          icon={Calendar}
          trend={2.1}
          color="green"
        />
        <StatCard
          title="TOTAL_PAYROLL"
          value={`$${(data.payroll?.totalNetSalary || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={8.7}
          color="yellow"
        />
        <StatCard
          title="LEAVE_REQUESTS"
          value={data.leave?.totalRequests || 0}
          icon={Award}
          trend={-3.2}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trends */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em] font-mono italic">ATTENDANCE_TRENDS_ANALYSIS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ 
                  border: '2px solid black', 
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={3} name="PRESENT" />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={3} name="ABSENT" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Distribution */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em] font-mono italic">LEAVE_DISTRIBUTION_METRICS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {leaveTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  border: '2px solid black', 
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em] font-mono italic">DEPARTMENT_DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ 
                  border: '2px solid black', 
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }} 
              />
              <Bar dataKey="employees" fill="#4F46E5" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Overview */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] p-8">
          <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em] font-mono italic">PERFORMANCE_OVERVIEW</h3>
          {data.performance?.averageRatings && Object.keys(data.performance.averageRatings).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(data.performance.averageRatings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest font-mono">
                    {key.replace(/([A-Z])/g, ' $1').trim()}_RATING
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 border-2 border-black h-4">
                      <div
                        className="bg-blue-600 h-2 mt-0.5"
                        style={{ width: `${(value / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-black font-mono uppercase">
                      {value?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-mono font-black uppercase tracking-widest mb-4">NO_PERFORMANCE_REVIEWS_FOUND</p>
              <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">PERFORMANCE_DATA_WILL_APPEAR_ONCE_REVIEWS_ARE_SUBMITTED</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
        <div className="p-6 border-b-2 border-black">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-mono italic">RECENT_ACTIVITY_LOG</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {data.employees?.recentEmployees?.slice(0, 5).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between border-b border-black pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-black bg-blue-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">{employee.name}</p>
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                      {employee.jobDetails?.jobPosition} • JOINED {new Date(employee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-black bg-green-500 text-white">
                  NEW
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
