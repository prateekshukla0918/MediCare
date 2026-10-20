import React from 'react';
import { Link } from 'react-router-dom';
import { Video, ShieldCheck, FileCheck, Stethoscope, Clock, Lock, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Platform Walkthrough</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How MediConnect Works</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          From symptom check to e-prescription: experience how virtual healthcare connects patients with top verified doctors in minutes.
        </p>
      </div>

      <div className="space-y-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-extrabold text-xl">
            1
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">Find & Filter Verified Specialists</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Search by clinical specialty (Cardiology, Dermatology, Pediatrics, Neurology, etc.), language, or consultation fee. Review real medical board credentials and patient satisfaction scores.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-extrabold text-xl">
            2
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">Select an Available Time Slot</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pick a date on the doctor's live calendar. Our atomic reservation engine checks active reservations in real-time to guarantee zero double bookings.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-extrabold text-xl">
            3
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">Attend Encrypted WebRTC Video Consultation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              At appointment time, launch the virtual consultation room. Enjoy crystal-clear encrypted audio/video directly in your browser. Doctors can review your uploaded medical reports during the call.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-extrabold text-xl">
            4
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900">Receive Digital Prescriptions & Care Plan</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your physician issues an official, versioned digital prescription containing dosage instructions, duration, and advice. Download your clinical PDF or book recommended follow-ups with 1 click.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-teal-50 border border-teal-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-teal-900">Ready to consult with a doctor?</h3>
        <Link
          to="/doctors"
          className="inline-block px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all"
        >
          Explore Doctors Now
        </Link>
      </div>
    </div>
  );
};
