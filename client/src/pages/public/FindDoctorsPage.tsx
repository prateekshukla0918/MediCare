import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Clock, 
  DollarSign, 
  Languages, 
  Award, 
  Filter, 
  RotateCcw,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DoctorProfile } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export const FindDoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState<string>(searchParams.get('specialization') || 'All');
  const [language, setLanguage] = useState<string>('All');
  const [maxFee, setMaxFee] = useState<number>(200);
  const [sort, setSort] = useState<string>('experience');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO' | 'CLINIC'>('VIDEO');
  const [symptoms, setSymptoms] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialization !== 'All') params.append('specialization', specialization);
      if (language !== 'All') params.append('language', language);
      if (maxFee < 200) params.append('maxFee', maxFee.toString());
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, language, maxFee, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('All');
    setLanguage('All');
    setMaxFee(200);
    setSort('experience');
    setSearchParams({});
  };

  // Fetch slots when booking doctor or date changes
  useEffect(() => {
    if (!bookingDoctor || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/doctors/${bookingDoctor.id}/slots?date=${selectedDate}`);
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
  }, [bookingDoctor, selectedDate]);

  // Handle Booking Submit
  const handleConfirmBooking = async () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    if (!selectedSlot) {
      setBookingError('Please select an available appointment time slot');
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
          doctorId: bookingDoctor!.id,
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
        setBookingDoctor(null);
        setBookingSuccess(false);
        navigate('/patient/appointments');
      }, 1800);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const specialtiesList = [
    'All',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'General Medicine',
    'Psychiatry',
    'Orthopedics',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Verified Doctors</h1>
        <p className="text-sm text-slate-600">
          Book immediate telemedicine consultations or schedule visits with board-certified healthcare professionals.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* Search input + Specialization pill filters */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, medical condition, or qualifications..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-sm shadow-teal-600/20"
          >
            Search
          </button>
        </form>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSpecialization(spec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                specialization === spec
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          
          {/* Language Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Hindi">Hindi</option>
              <option value="Mandarin">Mandarin</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Max Fee Slider */}
          <div className="space-y-1 sm:col-span-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Max Consultation Fee</span>
              <span className="font-bold text-teal-700">${maxFee}</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Sort Controls */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="experience">Years of Experience</option>
              <option value="fee_low">Consultation Fee: Low to High</option>
              <option value="fee_high">Consultation Fee: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Finding verified practitioners...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, increasing your fee threshold, or selecting another medical specialty.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Doctor Head Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={doctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user.name)}&background=0D9488&color=fff`}
                    alt={doctor.user.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-teal-600 transition-colors">
                        {doctor.user.name}
                      </h3>
                      <span title="Verified Practitioner">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-teal-600 truncate">{doctor.specialization}</p>
                    <p className="text-[11px] text-slate-500 truncate">{doctor.qualifications}</p>
                    {doctor.clinicHospital && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{doctor.clinicHospital}</p>
                    )}
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doctor.bio}
                </p>

                {/* Key Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                    {doctor.experienceYears} Yrs Exp
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                    🗣️ {doctor.languages}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold ml-auto">
                    ${doctor.fee} / visit
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold text-center transition-colors"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => setBookingDoctor(doctor)}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Book Consult
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Booking Modal */}
      {bookingDoctor && (
        <Modal
          isOpen={!!bookingDoctor}
          onClose={() => {
            setBookingDoctor(null);
            setBookingError(null);
          }}
          title={`Book Consultation with ${bookingDoctor.user.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500">
                  Your appointment has been reserved. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Doctor Mini Banner */}
                <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-3">
                  <img
                    src={bookingDoctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingDoctor.user.name)}&background=0D9488&color=fff`}
                    alt={bookingDoctor.user.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{bookingDoctor.user.name}</h4>
                    <p className="text-xs text-teal-700 font-semibold">{bookingDoctor.specialization}</p>
                    <p className="text-[11px] text-slate-500">Fee: ${bookingDoctor.fee} • 30-min Consultation</p>
                  </div>
                </div>

                {/* Consultation Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Consultation Type</label>
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
                      <Video className="w-4 h-4 text-teal-600" />
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
                      <span>📞 Audio Call</span>
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

                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Available Slots */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">Available Time Slots</label>
                    <span className="text-[11px] text-slate-400">All times in local timezone</span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No availability windows on this date. Please select another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
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

                {/* Reason / Symptoms input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Brief Reason or Symptoms (Optional)</label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe any symptoms or what you'd like to discuss..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Error Banner */}
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Confirmation Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={bookingLoading || !selectedSlot}
                    onClick={handleConfirmBooking}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? 'Reserving...' : 'Confirm & Book Appointment'}
                  </button>
                </div>
              </>
            )}

          </div>
        </Modal>
      )}

    </div>
  );
};
