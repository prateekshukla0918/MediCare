import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

export const AppointmentCalendarPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'WEEK' | 'DAY'>('WEEK');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch (err) {
        console.error('Error fetching calendar appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'WEEK') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'WEEK') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  // Generate week days
  const getWeekDays = (baseDate: Date) => {
    const start = new Date(baseDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointment Calendar</h1>
          <p className="text-sm text-slate-600">Review clinical consultation windows, scheduled appointments, and slots.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Week View Toggle */}
          <div className="p-1 rounded-xl bg-slate-200/80 grid grid-cols-2 text-xs font-semibold">
            <button
              onClick={() => setView('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'WEEK' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setView('DAY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'DAY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Day View
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      {view === 'WEEK' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d, index) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayAppointments = appointments.filter((a) => a.dateTime.startsWith(dateStr));

            return (
              <div
                key={index}
                className={`p-4 rounded-3xl border flex flex-col min-h-[350px] transition-all ${
                  isToday ? 'bg-teal-50/50 border-teal-300 shadow-sm' : 'bg-white border-slate-200'
                }`}
              >
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center ${
                    isToday ? 'bg-teal-600 text-white' : 'text-slate-800'
                  }`}>
                    {d.getDate()}
                  </span>
                </div>

                <div className="pt-3 space-y-2 flex-1">
                  {dayAppointments.length === 0 ? (
                    <span className="text-[11px] text-slate-400 block pt-4 text-center">No visits</span>
                  ) : (
                    dayAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                          appt.status === 'CONFIRMED'
                            ? 'bg-teal-50 border-teal-200 text-teal-900'
                            : appt.status === 'COMPLETED'
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-white/80">
                            {appt.consultationType}
                          </span>
                        </div>
                        <p className="font-semibold truncate">{appt.patient.user.name}</p>

                        {(appt.status === 'CONFIRMED' || appt.status === 'IN_PROGRESS') && (
                          <Link
                            to={`/consultation/${appt.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 pt-1"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join</span>
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Day View */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>

          <div className="space-y-3">
            {appointments.filter((a) => a.dateTime.startsWith(currentDate.toISOString().split('T')[0])).length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No consultations scheduled on this day.</p>
            ) : (
              appointments
                .filter((a) => a.dateTime.startsWith(currentDate.toISOString().split('T')[0]))
                .map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-bold text-xs flex flex-col items-center justify-center">
                        <span>{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{appt.patient.user.name}</h4>
                        <p className="text-xs text-slate-500">Ref: {appt.referenceId} • Status: {appt.status}</p>
                        {appt.symptoms && <p className="text-xs text-slate-400 italic">"{appt.symptoms}"</p>}
                      </div>
                    </div>

                    <Link
                      to={`/consultation/${appt.id}`}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Call</span>
                    </Link>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
