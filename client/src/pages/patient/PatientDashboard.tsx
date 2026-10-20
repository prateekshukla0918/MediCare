import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Clock, 
  Video, 
  Search, 
  Upload, 
  ChevronRight, 
  Activity, 
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment, Prescription, FollowUp, MedicalRecord } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [apptRes, rxRes, fuRes] = await Promise.all([
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/prescriptions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/follow-ups', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (apptRes.ok) {
          const data = await apptRes.json();
          setAppointments(data.appointments || []);
        }
        if (rxRes.ok) {
          const data = await rxRes.json();
          setPrescriptions(data.prescriptions || []);
        }
        if (fuRes.ok) {
          const data = await fuRes.json();
          setFollowUps(data.followUps || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Calculations
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const pendingFollowUps = followUps.filter((f) => f.status === 'PENDING');

  // Next Appointment is earliest upcoming appointment
  const nextAppointment = upcomingAppointments.length > 0
    ? [...upcomingAppointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    : null;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading your patient portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Welcome to your patient health hub. Manage your consultations, records, and follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm shadow-teal-600/20 transition-all hover:scale-102"
          >
            <Search className="w-4 h-4" />
            <span>Book New Doctor</span>
          </Link>
          <Link
            to="/patient/records"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Upload Record</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Upcoming Visits</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{upcomingAppointments.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Completed Visits</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{completedAppointments.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Prescriptions</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{prescriptions.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Pending Follow-ups</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{pendingFollowUps.length}</span>
          </div>
        </div>
      </div>

      {/* Spotlight: Next Appointment Card */}
      {nextAppointment ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <img
                src={nextAppointment.doctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextAppointment.doctor.user.name)}&background=0D9488&color=fff`}
                alt={nextAppointment.doctor.user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-teal-400/40"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Next Scheduled Care</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{nextAppointment.doctor.user.name}</h3>
                <p className="text-xs text-teal-300 font-semibold">{nextAppointment.doctor.specialization}</p>
                <p className="text-xs text-slate-300 pt-1">
                  📅 {new Date(nextAppointment.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                  {new Date(nextAppointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Mode: {nextAppointment.consultationType}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/consultation/${nextAppointment.id}`}
                className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/30 transition-all hover:scale-102"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Consultation</span>
              </Link>
              <Link
                to="/patient/appointments"
                className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-teal-50/70 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900">No appointments scheduled</h3>
            <p className="text-xs text-slate-600">You don't have any upcoming consultations. Need to see a doctor?</p>
          </div>
          <Link
            to="/doctors"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Find a Specialist
          </Link>
        </div>
      )}

      {/* Main Grid: Recent Prescriptions & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Prescriptions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Digital Prescriptions</h3>
            </div>
            <Link to="/patient/prescriptions" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No prescriptions issued yet.</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">
                      {rx.referenceNo}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{rx.doctor.user.name} ({rx.doctor.specialization})</h4>
                    <p className="text-[11px] text-slate-500">{rx.items.length} prescribed medication(s)</p>
                  </div>
                  <Link
                    to="/patient/prescriptions"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-teal-500 transition-colors"
                  >
                    View Rx
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Follow-Ups */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recommended Follow-Ups</h3>
            </div>
            <Link to="/patient/follow-ups" className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {followUps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending follow-ups recorded.</p>
          ) : (
            <div className="space-y-3">
              {followUps.slice(0, 3).map((fu) => (
                <div key={fu.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Due: {new Date(fu.recommendedDate).toLocaleDateString()}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{fu.doctor.user.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{fu.instructions}</p>
                  </div>
                  <Link
                    to={`/doctors/${fu.doctorId}`}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-all"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
