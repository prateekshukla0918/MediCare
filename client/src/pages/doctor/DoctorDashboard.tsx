import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  Video, 
  CheckCircle, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment, FollowUp } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [apptRes, fuRes] = await Promise.all([
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/follow-ups', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (apptRes.ok) {
          const data = await apptRes.json();
          setAppointments(data.appointments || []);
        }
        if (fuRes.ok) {
          const data = await fuRes.json();
          setFollowUps(data.followUps || []);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Today's appointments
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  const todayAppointments = appointments.filter((a) => {
    return a.dateTime.startsWith(todayDateStr) && (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  });

  const upcomingAppointments = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  // Next patient to see
  const nextPatientAppt = upcomingAppointments.length > 0
    ? [...upcomingAppointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    : null;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading clinical dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.name}
            </h1>
            <span title="Board-Verified Practitioner">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {user?.doctorProfile?.specialization} • Practice License: {user?.doctorProfile?.regNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/doctor/prescriptions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Prescription</span>
          </Link>
          <Link
            to="/doctor/calendar"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Today's Visits</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{todayAppointments.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Upcoming</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{upcomingAppointments.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Completed Consults</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{completedAppointments.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Active Patients</span>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {new Set(appointments.map((a) => a.patientId)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Spotlight: Next Patient Consultation Banner */}
      {nextPatientAppt ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={nextPatientAppt.patient.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextPatientAppt.patient.user.name)}&background=0D9488&color=fff`}
              alt={nextPatientAppt.patient.user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-teal-400/40"
            />
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider inline-block">
                Next In Line
              </span>
              <h3 className="text-lg sm:text-xl font-bold">{nextPatientAppt.patient.user.name}</h3>
              <p className="text-xs text-slate-300">
                Scheduled:{' '}
                <strong>
                  {new Date(nextPatientAppt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>{' '}
                • {nextPatientAppt.consultationType} Call
              </p>
              {nextPatientAppt.symptoms && (
                <p className="text-xs text-slate-400 italic">Chief complaint: "{nextPatientAppt.symptoms}"</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/consultation/${nextPatientAppt.id}`}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-102"
            >
              <Video className="w-4 h-4" />
              <span>Launch Video Room</span>
            </Link>
            <Link
              to={`/doctor/patients/${nextPatientAppt.patientId}`}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Patient Chart
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No consultations in queue</h3>
          <p className="text-xs text-slate-500">Your upcoming consultations will appear here automatically.</p>
        </div>
      )}

      {/* Today's Schedule Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Today's Appointment Schedule</h3>
          </div>
          <Link to="/doctor/calendar" className="text-xs text-teal-600 hover:text-teal-700 font-semibold">
            Open Full Calendar
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled for today.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((appt) => (
              <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex flex-col items-center justify-center leading-tight">
                    <span>{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{appt.patient.user.name}</h4>
                    <p className="text-xs text-slate-500">Ref: {appt.referenceId} • Mode: {appt.consultationType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/consultation/${appt.id}`}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Consultation</span>
                  </Link>
                  <Link
                    to={`/doctor/patients/${appt.patientId}`}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Patient Chart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
