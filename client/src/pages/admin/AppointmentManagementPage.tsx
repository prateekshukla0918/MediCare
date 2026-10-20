import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

export const AppointmentManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'ALL') params.append('status', status);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token, status]);

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.referenceId.toLowerCase().includes(term) ||
      a.doctor.user.name.toLowerCase().includes(term) ||
      a.patient.user.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointment Oversight</h1>
        <p className="text-sm text-slate-600">Platform-wide consultation oversight, scheduling state logs, and conflict investigations.</p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref ID, doctor, or patient..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-Show</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500">No records match the current status filter.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Scheduled Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-teal-700">{a.referenceId}</td>
                  <td className="p-4 font-semibold text-slate-900">{a.doctor.user.name}</td>
                  <td className="p-4 text-slate-700">{a.patient.user.name}</td>
                  <td className="p-4 text-slate-600">
                    {new Date(a.dateTime).toLocaleDateString()} at{' '}
                    {new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-500">{a.consultationType}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      a.status === 'CONFIRMED' ? 'bg-teal-50 text-teal-700' :
                      a.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                      a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {a.status}
                    </span>
                    {a.cancelReason && (
                      <span className="block text-[10px] text-rose-500 mt-0.5 truncate max-w-xs">
                        {a.cancelReason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
