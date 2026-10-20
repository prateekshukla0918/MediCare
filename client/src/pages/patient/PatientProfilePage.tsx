import React, { useState } from 'react';
import { User, ShieldCheck, Lock, Smartphone, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile information updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Security</h1>
        <p className="text-sm text-slate-600">Manage your patient identity, account security, and active telemedicine consent.</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <span>Personal Information</span>
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Full Name</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              defaultValue={user?.email}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Phone Number</label>
            <input
              type="tel"
              defaultValue={user?.phone || '+1 (555) 019-2831'}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Date of Birth</label>
            <input
              type="date"
              defaultValue={user?.patientProfile?.dob || '1992-05-14'}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              Update Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* Account Security & Sessions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600" />
          <span>Security & Sessions</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Two-Factor Authentication (2FA)</span>
              <span className="text-slate-500">Secure your consultations with verification prompts</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ENABLED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Active Device Session</span>
              <span className="text-slate-500">macOS • Chrome Browser • Current active session</span>
            </div>
            <span className="text-teal-700 font-bold">This Device</span>
          </div>
        </div>
      </div>

      {/* Consent & Data Policy */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>Telemedicine Consent & Data Sovereignty</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your medical records are encrypted and shared exclusively with doctors you consult with. You maintain full ownership and can request complete electronic archive downloads or deletion in accordance with healthcare privacy standards.
        </p>
      </div>

    </div>
  );
};
