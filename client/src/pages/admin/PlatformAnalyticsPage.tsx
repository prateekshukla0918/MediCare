import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert,
  Percent,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsKPIs } from '../../types';

export const PlatformAnalyticsPage: React.FC = () => {
  const { token } = useAuth();

  // Global Filters
  const [days, setDays] = useState('30');
  const [specialization, setSpecialization] = useState('ALL');
  const [consultationType, setConsultationType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Analytics Data
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({
        days,
        specialization,
        consultationType,
        status,
      }).toString();

      const [kpiRes, trendsRes, statusRes, specRes, workRes, regRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/analytics/trends?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/analytics/status-distribution?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/analytics/specializations?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/analytics/doctor-workload?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/analytics/registrations?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (kpiRes.ok) setKpis((await kpiRes.json()).kpis);
      if (trendsRes.ok) setTrends((await trendsRes.json()).trends || []);
      if (statusRes.ok) setStatusDist((await statusRes.json()).distribution || []);
      if (specRes.ok) setSpecialties((await specRes.json()).specializations || []);
      if (workRes.ok) setWorkload((await workRes.json()).workload || []);
      if (regRes.ok) setRegistrations((await regRes.json()).registrations || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, specialization, consultationType, status, token]);

  const handleResetFilters = () => {
    setDays('30');
    setSpecialization('ALL');
    setConsultationType('ALL');
    setStatus('ALL');
  };

  const handleExportCsv = async () => {
    if (!token) return;
    const q = new URLSearchParams({ days, specialization, consultationType, status }).toString();
    window.open(`/api/admin/analytics/export?${q}&token=${token}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Operational Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              PAGE 22 AUDIT
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Real operational telemedicine intelligence computed directly from active database records.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV Report</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Operational Aggregation Filters
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 block">Time Cohort Range</label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days (Standard)</option>
              <option value="90">Last 90 Days (Quarterly)</option>
              <option value="365">Last 365 Days (Yearly)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 block">Doctor Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">All Specializations</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 block">Consultation Type</label>
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">All Types</option>
              <option value="VIDEO">Encrypted HD Video</option>
              <option value="AUDIO">Audio Call</option>
              <option value="CLINIC">In-Clinic Consult</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 block">Appointment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed Only</option>
              <option value="CONFIRMED">Confirmed Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 Section 5.B KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* KPI 1 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Appointments</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 block">{kpis?.totalAppointments || 0}</span>
          <p className="text-[11px] text-slate-500">
            Appointments created within the selected {days}-day period.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Consultations</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 block">{kpis?.completedConsultations || 0}</span>
          <p className="text-[11px] text-slate-500">
            Visits marked completed by attending doctors.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancellation Rate</span>
            <Percent className="w-5 h-5 text-rose-600" />
          </div>
          <span className="text-3xl font-extrabold text-rose-600 block">{kpis?.cancellationRate || 0}%</span>
          <p className="text-[11px] text-slate-500">
            Ratio of cancelled appointments to eligible bookings.
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-3xl font-extrabold text-teal-700 block">{kpis?.completionRate || 0}%</span>
          <p className="text-[11px] text-slate-500">
            Completed visits divided by past expected consultations.
          </p>
        </div>

        {/* KPI 5 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Time to Appointment</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 block">{kpis?.avgWaitHours || 24} hrs</span>
          <p className="text-[11px] text-slate-500">
            Average delay between booking creation and visit time.
          </p>
        </div>

        {/* KPI 6 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Backlog</span>
            <ShieldAlert className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-3xl font-extrabold text-purple-700 block">{kpis?.verificationBacklog || 0}</span>
          <p className="text-[11px] text-slate-500">
            Doctor credential applications currently awaiting review.
          </p>
        </div>

      </div>

      {/* Chart 1: Appointment Trends LineChart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chart 1: Appointment & Consultation Trends</h3>
            <p className="text-xs text-slate-500">Growth trajectory of bookings, completed care sessions, and cancellations.</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="booked" name="Booked Visits" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="completed" name="Completed Care" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts 2 & 3: Donut Distribution & Popular Specializations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 2: Status Distribution Pie */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chart 2: Status Distribution</h3>
            <p className="text-xs text-slate-500">Mutual exclusivity breakdown of appointment states.</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0D9488'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Popular Specializations BarChart */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chart 3: Popular Specializations Demand</h3>
            <p className="text-xs text-slate-500">Total appointments and completed care by clinical specialty.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialties} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="specialization" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="booked" name="Booked" fill="#0D9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts 4 & 5: Doctor Workload & Registration Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 4: Doctor Workload */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chart 4: Doctor Caseload & Workload</h3>
            <p className="text-xs text-slate-500">Consultation volume distribution across verified attending doctors.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="doctor" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="appointments" name="Total Appointments" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Visits" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Registration Trends AreaChart */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chart 5: User Registration & Adoption Trends</h3>
            <p className="text-xs text-slate-500">Adoption growth for patients and verified doctors.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrations} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="patients" name="New Patients" stroke="#0D9488" fillOpacity={1} fill="url(#colorPatients)" />
                <Area type="monotone" dataKey="doctors" name="New Doctors" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDoctors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
