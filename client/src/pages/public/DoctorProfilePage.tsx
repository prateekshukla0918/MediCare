import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Languages, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Video, 
  Star,
  ChevronLeft
} from 'lucide-react';
import { DoctorProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Slot booking state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO' | 'CLINIC'>('VIDEO');
  const [symptoms, setSymptoms] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDoctor(data.doctor);
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/doctors/${id}/slots?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    if (!selectedSlot) {
      setBookingError('Please choose an available appointment time slot');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const token = localStorage.getItem('mediconnect_token');
      const dateTime = `${selectedDate}T${selectedSlot}:00`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: id,
          dateTime,
          consultationType,
          symptoms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3">Loading physician credentials...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested specialist could not be located.</p>
        <Link to="/doctors" className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Back to Doctor Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Doctor Profile & Credentials */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <img
                src={doctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user.name)}&background=0D9488&color=fff`}
                alt={doctor.user.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-teal-500/20 shadow-md"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{doctor.user.name}</h1>
                  <span title="Board-Verified Practitioner">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                  </span>
                </div>
                <p className="text-sm font-bold text-teal-600">{doctor.specialization}</p>
                <p className="text-xs text-slate-600 font-medium">{doctor.qualifications}</p>
                {doctor.clinicHospital && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{doctor.clinicHospital}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Experience</span>
                <span className="text-sm font-extrabold text-slate-800">{doctor.experienceYears} Years</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Consultation Fee</span>
                <span className="text-sm font-extrabold text-teal-700">${doctor.fee}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[11px] text-slate-400 block font-medium">Languages</span>
                <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{doctor.languages}</span>
              </div>
            </div>
          </div>

          {/* Professional Biography */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About the Physician</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          {/* Credentials & Medical Registration */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Clinical Verification & Licensure</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Medical Registration Number</span>
                  <span className="font-bold text-slate-900 font-mono">{doctor.regNumber}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  VERIFIED ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Academic Degrees</span>
                  <span className="font-semibold text-slate-800">{doctor.qualifications}</span>
                </div>
                <Award className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Booking Widget */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Schedule Consultation</h3>
              <p className="text-xs text-slate-500">Pick your preferred date and time slot.</p>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Booking Confirmed!</h4>
                <p className="text-xs text-slate-500">
                  Your appointment with {doctor.user.name} is scheduled. Redirecting to your appointments...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-5">
                
                {/* Consultation Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('VIDEO')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        consultationType === 'VIDEO'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      <span>HD Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('AUDIO')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        consultationType === 'AUDIO'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>📞 Audio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('CLINIC')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        consultationType === 'CLINIC'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>🏥 In-Clinic</span>
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Select Appointment Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Slot Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">Available Slots</label>
                    <span className="text-[10px] text-slate-400">30 min duration</span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                      No open slots on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2 px-1 text-xs rounded-xl font-semibold transition-all ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                              : selectedSlot === slot.time
                              ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/30'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-teal-50/50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Symptoms / Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Symptoms / Consultation Notes</label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Briefly state your concern..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Reserving Slot...' : `Confirm Booking ($${doctor.fee})`}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
