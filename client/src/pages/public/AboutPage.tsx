import React from 'react';
import { ShieldCheck, Heart, Award, Lock, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Our Mission</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">About MediConnect</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          We are dedicated to bridging clinical distance with high-integrity virtual care, verified practitioners, and secure electronic health tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Vetted Clinical Network</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every practitioner on MediConnect is reviewed by our medical directorate, confirming medical licenses and board certifications.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Privacy & Compliance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Patient health data is encrypted both in transit and at rest. Video consultations stream peer-to-peer using encrypted WebRTC.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Holistic Continuity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Healthcare extends beyond a single 15-minute call. MediConnect integrates past medical records, e-prescriptions, and follow-up schedules.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Telemedicine & Health Privacy Statement</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          MediConnect complies with applicable telemedicine guidelines and data protection regulations. Consultations are conducted exclusively by licensed physicians. Prescriptions generated via MediConnect conform to statutory digital health standards.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          This platform is an operational prototype built with synthetic demonstration profiles. If you have an emergency medical concern, contact local emergency services immediately.
        </p>
      </div>
    </div>
  );
};
