import React, { useState } from 'react';
import { User, ShieldCheck, Award, MapPin, CheckCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DoctorProfilePage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();

  const [specialization, setSpecialization] = useState(user?.doctorProfile?.specialization || 'Cardiology');
  const [qualifications, setQualifications] = useState(user?.doctorProfile?.qualifications || 'MD, FACC');
  const [bio, setBio] = useState(user?.doctorProfile?.bio || '');
  const [languages, setLanguages] = useState(user?.doctorProfile?.languages || 'English, Spanish');
  const [clinicHospital, setClinicHospital] = useState(user?.doctorProfile?.clinicHospital || 'Boston Medical Pavilion');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/doctors/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialization,
          qualifications,
          bio,
          languages,
          clinicHospital,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Professional profile successfully updated.');
        refreshUser();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Profile</h1>
        <p className="text-sm text-slate-600">Manage your clinical identity, medical council registration, and patient-facing biography.</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Clinical Verification Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                {user?.doctorProfile?.verificationStatus || 'VERIFIED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Registration Number: <strong className="font-mono">{user?.doctorProfile?.regNumber}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Physician Information</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Full Name (Read-only)</label>
              <input
                type="text"
                disabled
                defaultValue={user?.name}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Clinical Specialization</label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Medical Qualifications & Degrees</label>
              <input
                type="text"
                required
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. MD, FACC - Harvard Medical School"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Hospital / Clinic Affiliation</label>
              <input
                type="text"
                value={clinicHospital}
                onChange={(e) => setClinicHospital(e.target.value)}
                placeholder="e.g. Boston Cardiovascular Center"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 block">Languages Spoken</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Spanish, Hindi"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 block">Professional Clinical Biography</label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Summarize your clinical philosophy and areas of focus..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
