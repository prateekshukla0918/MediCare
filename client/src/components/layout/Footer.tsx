import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Lock, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Medi<span className="text-teal-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart healthcare and telemedicine platform delivering seamless virtual care, verified practitioners, digital prescriptions, and encrypted health records.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & End-to-End Encrypted</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Patient Care</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Find Verified Specialists</Link></li>
              <li><Link to="/how-it-works" className="hover:text-teal-400 transition-colors">How Telemedicine Works</Link></li>
              <li><Link to="/patient/records" className="hover:text-teal-400 transition-colors">Electronic Health Records</Link></li>
              <li><Link to="/patient/prescriptions" className="hover:text-teal-400 transition-colors">Digital Prescriptions</Link></li>
            </ul>
          </div>

          {/* Doctors & Clinical Network */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Practitioners</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/auth?mode=register" className="hover:text-teal-400 transition-colors">Join as a Doctor</Link></li>
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">Clinical Verification Standards</Link></li>
              <li><Link to="/doctor/dashboard" className="hover:text-teal-400 transition-colors">Doctor Portal</Link></li>
              <li><Link to="/admin/overview" className="hover:text-teal-400 transition-colors">Clinical Operations</Link></li>
            </ul>
          </div>

          {/* Trust, Security & Emergency */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Clinical Notice</h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-rose-400 block mb-1">Medical Emergency Disclaimer</span>
              MediConnect is designed for routine and scheduled virtual consultations. In the event of a life-threatening emergency, please dial 911 or visit your nearest hospital emergency department immediately.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediConnect Inc. All rights reserved. Built for quality virtual care.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Care</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Telemedicine Consent</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
