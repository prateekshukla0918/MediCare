import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuditLog } from '../../types';

export const AdminOverviewPage: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRecentLogs(data.recentAuditLogs || []);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [token]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Operations Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-sm text-slate-600">Real-time health operations monitoring, practitioner verification queue, and security audits.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Operational Analytics</span>
          </Link>
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Verification Queue ({metrics?.pendingVerifications || 0})</span>
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Patients</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{metrics?.totalPatients || 0}</span>
            <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Active Patient Cohort</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Doctors</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{metrics?.activeDoctors || 0}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Board Verified</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Verifications</span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">{metrics?.pendingVerifications || 0}</span>
            <Link to="/admin/verification" className="text-[11px] text-amber-700 font-semibold mt-1 block hover:underline">
              Requires Review &rarr;
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Visits Today</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{metrics?.appointmentsToday || 0}</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Scheduled for Today</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Completed Consults</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{metrics?.completedAppointments || 0}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Successfully Concluded</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cancellation Rate</span>
            <span className="text-3xl font-black text-rose-600 mt-1 block">{metrics?.cancellationRate || 0}%</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Platform-wide Ratio</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Verification Notice Banner if items pending */}
      {metrics?.pendingVerifications > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white shrink-0" />
            <div>
              <h3 className="font-bold text-base">Doctor Verification Applications Awaiting Review</h3>
              <p className="text-xs text-amber-100">
                {metrics.pendingVerifications} physician(s) have submitted credentials requiring medical council verification before their calendar can accept bookings.
              </p>
            </div>
          </div>
          <Link
            to="/admin/verification"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-sm transition-all"
          >
            Review Queue
          </Link>
        </div>
      )}

      {/* Live Audit Log Feed */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Clinical & Security Audit Feed</h3>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
            View Complete Logs
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No recent audit logs.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.resource}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="block font-semibold text-slate-600">{log.actorName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
