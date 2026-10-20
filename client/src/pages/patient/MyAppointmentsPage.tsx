import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment, AppointmentStatus } from '../../types';
import { Modal } from '../../components/common/Modal';

export const MyAppointmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  // Reschedule state
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cancel state
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // Fetch slots for reschedule
  useEffect(() => {
    if (!reschedulingAppt || !newDate) return;
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/doctors/${reschedulingAppt.doctorId}/slots?date=${newDate}`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      }
    };
    fetchSlots();
  }, [reschedulingAppt, newDate]);

  const handleReschedule = async () => {
    if (!selectedSlot || !reschedulingAppt) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const newDateTime = `${newDate}T${selectedSlot}:00`;
      const res = await fetch(`/api/appointments/${reschedulingAppt.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newDateTime }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule');

      setReschedulingAppt(null);
      fetchAppointments();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingAppt) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/appointments/${cancellingAppt.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel');

      setCancellingAppt(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED' || a.status === 'NO_SHOW';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-sm text-slate-600">Review scheduled consultations, launch video rooms, or reschedule slots.</p>
        </div>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <span>Book Consultation</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'UPCOMING' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Upcoming Appointments</span>
          {activeTab === 'UPCOMING' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'COMPLETED' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Completed Visits</span>
          {activeTab === 'COMPLETED' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'CANCELLED' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Cancelled & Past</span>
          {activeTab === 'CANCELLED' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No {activeTab.toLowerCase()} appointments found</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'UPCOMING' ? "You don't have any pending visits. Search specialists to schedule care." : 'No history in this category.'}
          </p>
          {activeTab === 'UPCOMING' && (
            <Link to="/doctors" className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
              Find a Doctor
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={appt.doctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.doctor.user.name)}&background=0D9488&color=fff`}
                  alt={appt.doctor.user.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {appt.referenceId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      appt.status === 'CONFIRMED' ? 'bg-teal-50 text-teal-700' :
                      appt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{appt.doctor.user.name}</h3>
                  <p className="text-xs font-semibold text-teal-600">{appt.doctor.specialization}</p>
                  
                  <p className="text-xs text-slate-600 pt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(appt.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-teal-700">
                      {appt.consultationType === 'VIDEO' && <Video className="w-3.5 h-3.5" />}
                      {appt.consultationType === 'AUDIO' && <Phone className="w-3.5 h-3.5" />}
                      {appt.consultationType === 'CLINIC' && <MapPin className="w-3.5 h-3.5" />}
                      {appt.consultationType}
                    </span>
                  </p>

                  {appt.symptoms && (
                    <p className="text-xs text-slate-500 italic pt-1">
                      Reason: "{appt.symptoms}"
                    </p>
                  )}

                  {appt.cancelReason && (
                    <p className="text-xs text-rose-600 pt-1">
                      Cancelled by {appt.cancelledBy || 'User'}: {appt.cancelReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {(appt.status === 'CONFIRMED' || appt.status === 'IN_PROGRESS') && (
                  <>
                    <Link
                      to={`/consultation/${appt.id}`}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all hover:scale-102"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Consultation</span>
                    </Link>

                    <button
                      onClick={() => setReschedulingAppt(appt)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Reschedule
                    </button>

                    <button
                      onClick={() => setCancellingAppt(appt)}
                      className="px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {appt.status === 'COMPLETED' && (
                  <Link
                    to="/patient/prescriptions"
                    className="px-4 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs transition-colors"
                  >
                    View Prescription
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <Modal
          isOpen={!!reschedulingAppt}
          onClose={() => setReschedulingAppt(null)}
          title={`Reschedule with ${reschedulingAppt.doctor.user.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select a new date and an available slot. Your existing slot ({new Date(reschedulingAppt.dateTime).toLocaleString()}) will be released atomically upon confirmation.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Available Slots</label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={`py-1.5 text-xs rounded-xl font-semibold transition-all ${
                      !s.available
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : selectedSlot === s.time
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-teal-50'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !selectedSlot}
                onClick={handleReschedule}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {cancellingAppt && (
        <Modal
          isOpen={!!cancellingAppt}
          onClose={() => setCancellingAppt(null)}
          title="Cancel Appointment"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your appointment with <strong>{cancellingAppt.doctor.user.name}</strong> on {new Date(cancellingAppt.dateTime).toLocaleString()}?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Reason for Cancellation</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Schedule conflict, resolved symptoms..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
