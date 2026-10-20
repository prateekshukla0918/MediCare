import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AvailabilitySettingsPage: React.FC = () => {
  const { user, token } = useAuth();

  const [fee, setFee] = useState<number>(user?.doctorProfile?.fee || 120);
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [bufferTime, setBufferTime] = useState<number>(10);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');

  const [days, setDays] = useState<{ [day: number]: boolean }>({
    1: true, // Monday
    2: true, // Tuesday
    3: true, // Wednesday
    4: true, // Thursday
    5: true, // Friday
    6: true, // Saturday
    0: false, // Sunday
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const dayNames = [
    { num: 1, label: 'Monday' },
    { num: 2, label: 'Tuesday' },
    { num: 3, label: 'Wednesday' },
    { num: 4, label: 'Thursday' },
    { num: 5, label: 'Friday' },
    { num: 6, label: 'Saturday' },
    { num: 0, label: 'Sunday' },
  ];

  const handleDayToggle = (dayNum: number) => {
    setDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      // 1. Update availability schedule
      const schedule = dayNames
        .filter((d) => days[d.num])
        .map((d) => ({
          dayOfWeek: d.num,
          startTime,
          endTime,
          slotDuration,
          bufferTime,
          isActive: true,
        }));

      await Promise.all([
        fetch('/api/doctors/availability', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schedule }),
        }),
        fetch('/api/doctors/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fee }),
        }),
      ]);

      setSuccessMsg('Availability windows and consultation fee updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Availability & Clinic Settings</h1>
        <p className="text-sm text-slate-600">Control your weekly consultation calendar, booking slots, and fee configuration.</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Weekly Working Days */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Weekly Consultation Days</span>
          </h3>
          <p className="text-xs text-slate-500">Toggle the days you are available for virtual appointments.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            {dayNames.map((d) => {
              const active = days[d.num];
              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => handleDayToggle(d.num)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                    active
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                      : 'border-slate-200 text-slate-400 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">{d.label.slice(0, 3)}</span>
                  <span className="text-[10px] font-medium block mt-0.5">{active ? 'Open' : 'Off'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours & Slot Duration */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Working Hours & Interval Setup</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Daily Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Daily End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Buffer Between Slots</label>
              <select
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            <span>Consultation Pricing</span>
          </h3>

          <div className="max-w-xs space-y-1 text-xs">
            <label className="font-semibold text-slate-700 block">Telemedicine Fee ($ USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input
                type="number"
                min="20"
                max="500"
                step="5"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400">Displayed on your public booking profile.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Availability Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
