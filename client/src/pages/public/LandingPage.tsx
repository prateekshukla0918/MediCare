import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Video,
  ShieldCheck,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
  UserCheck,
  ChevronDown,
  Lock,
  Activity,
  ArrowRight,
  Heart,
  Brain,
  Baby,
  Stethoscope,
  Eye,
  Bone,
  Zap,
  Users,
  TrendingUp,
  BadgeCheck,
} from 'lucide-react';

const STATS = [
  { label: 'Verified Doctors', value: '2,400+', icon: BadgeCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Consultations Done', value: '180K+', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Patient Rating', value: '4.9 / 5', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Countries Served', value: '42', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const SPECIALTIES = [
  { name: 'Cardiology', icon: Heart, color: 'bg-rose-50 text-rose-600', border: 'hover:border-rose-300', doctors: 14 },
  { name: 'Neurology', icon: Brain, color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300', doctors: 11 },
  { name: 'Pediatrics', icon: Baby, color: 'bg-sky-50 text-sky-600', border: 'hover:border-sky-300', doctors: 18 },
  { name: 'General Medicine', icon: Stethoscope, color: 'bg-teal-50 text-teal-600', border: 'hover:border-teal-300', doctors: 35 },
  { name: 'Ophthalmology', icon: Eye, color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-300', doctors: 9 },
  { name: 'Orthopedics', icon: Bone, color: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-300', doctors: 13 },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Find Your Doctor',
    desc: 'Browse verified specialist profiles, credentials, and real patient reviews to choose the right physician.',
    icon: Search,
    color: 'bg-teal-500',
  },
  {
    step: '02',
    title: 'Book a Slot',
    desc: 'Pick a time that works for you. Real-time availability prevents double bookings automatically.',
    icon: Calendar,
    color: 'bg-blue-500',
  },
  {
    step: '03',
    title: 'Video Consultation',
    desc: 'Join the encrypted HD video room directly in your browser — no app downloads required.',
    icon: Video,
    color: 'bg-purple-500',
  },
  {
    step: '04',
    title: 'Prescription & Care',
    desc: 'Get a certified digital prescription immediately after consultation with follow-up care tracking.',
    icon: FileText,
    color: 'bg-emerald-500',
  },
];

const FAQS = [
  {
    q: 'How does the video consultation work?',
    a: 'After booking a slot with a verified doctor, you receive a secure link. Click "Join Consultation" from your dashboard at the scheduled time to enter an encrypted WebRTC room — no plugins, no downloads.',
  },
  {
    q: 'How are doctors verified?',
    a: 'Every doctor undergoes a strict credential review: we verify state medical council licenses, board certifications, malpractice standing, and degrees before granting booking privileges.',
  },
  {
    q: 'How do I receive my digital prescription?',
    a: 'Your prescription appears immediately in your Patient Portal after the consultation with medication details, dosages, and instructions. You can download a signed clinical PDF anytime.',
  },
  {
    q: 'Is my health data HIPAA-compliant and secure?',
    a: 'Yes. All data is encrypted with 256-bit AES. Video calls use direct peer-to-peer WebRTC encryption. Records have strict role-based access so only you and your authorized doctor can view them.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.append('search', searchTerm);
    if (specialization !== 'All') query.append('specialization', specialization);
    navigate(`/doctors?${query.toString()}`);
  };

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f8fafc 100%)',
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT */}
            <div className="space-y-7">
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-sm text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Next-Gen Virtual Healthcare Platform
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                  Expert care,
                </h1>
                <h1
                  className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  wherever you are.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg pt-2">
                  Connect with board-certified physicians for HD video consultations, instant digital prescriptions, and continuous follow-up care — all without the waiting room.
                </p>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2 flex flex-col sm:flex-row gap-2 max-w-lg"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search doctor or condition…"
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder-slate-400 text-slate-800"
                  />
                </div>
                <div className="sm:border-l border-slate-100 flex items-center px-3 py-2">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="text-sm bg-transparent border-none outline-none text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="All">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                    boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                  }}
                >
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-5">
                {[
                  { icon: CheckCircle2, text: '100% Verified Physicians' },
                  { icon: Lock, text: 'End-to-End Encrypted' },
                  { icon: Zap, text: 'Instant Digital Rx' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Icon className="w-4 h-4 text-teal-600" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Doctor preview card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">

                {/* Main card */}
                <div
                  className="bg-white rounded-3xl p-5 space-y-4"
                  style={{ boxShadow: '0 24px 60px rgba(13,148,136,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}
                >
                  {/* Doctor header */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                        alt="Dr. Sarah Jenkins"
                        className="w-16 h-16 rounded-2xl object-cover"
                        style={{ boxShadow: '0 4px 12px rgba(13,148,136,0.2)' }}
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">Dr. Sarah Jenkins</span>
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-teal-600 mt-0.5">Senior Cardiologist</p>
                      <p className="text-[11px] text-slate-500">Harvard Medical School · 14 Yrs Exp</p>
                    </div>
                  </div>

                  {/* Rating row */}
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">4.9</span>
                    <span className="text-xs text-slate-400">· 1,400+ consultations</span>
                  </div>

                  {/* Slot booking */}
                  <div
                    className="rounded-2xl p-3.5 flex items-center justify-between gap-3"
                    style={{ background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)' }}
                  >
                    <div>
                      <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">Next Available</p>
                      <p className="text-sm font-bold text-slate-900">Today at 10:30 AM</p>
                      <p className="text-[11px] text-slate-500">Video consultation · $120</p>
                    </div>
                    <Link
                      to="/doctors"
                      className="shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                        boxShadow: '0 4px 12px rgba(13,148,136,0.35)',
                      }}
                    >
                      Book Slot
                    </Link>
                  </div>

                  {/* Live tag */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">Available now for consultation</span>
                  </div>
                </div>

                {/* Floating WebRTC badge — now properly positioned ABOVE card, not overflowing */}
                <div
                  className="absolute -top-4 -right-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">WebRTC Encrypted</p>
                    <p className="text-[10px] text-slate-400">Peer-to-peer HD video</p>
                  </div>
                </div>

                {/* Floating consult fee badge */}
                <div
                  className="absolute -bottom-4 -left-4 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
                  style={{
                    background: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(226,232,240,0.8)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 leading-tight">Consultations Today</p>
                    <p className="text-sm font-bold text-slate-900">284 Active</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── STATS BAND ───────────────────────────────────────── */}
      <div className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
            {STATS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 leading-tight">{value}</p>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SPECIALTIES ──────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Medical Departments</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Browse by Specialization</h2>
            </div>
            <Link to="/doctors" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 shrink-0">
              View all specialists <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPECIALTIES.map(({ name, icon: Icon, color, border, doctors }) => (
              <Link
                key={name}
                to={`/doctors?specialization=${encodeURIComponent(name)}`}
                className={`group bg-white rounded-2xl p-5 border border-slate-200 ${border} hover:shadow-lg transition-all text-center`}
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">{name}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{doctors} specialists</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Simple 4-Step Process</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How MediConnect Works</h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">A seamless virtual clinic experience from first search to follow-up care.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }, i) => (
              <div key={step} className="relative group">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%-8px)] w-full h-px bg-slate-200 z-0" style={{ width: 'calc(100% - 40px)', left: '60px' }} />
                )}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 group-hover:border-teal-200 group-hover:shadow-md transition-all relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-200">{step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY BANNER ──────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
          >
            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)' }} />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12">
              {/* Left */}
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-teal-400 border border-teal-800" style={{ background: 'rgba(13,148,136,0.1)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Security & Clinical Integrity
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Your health data, protected with uncompromising standards.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Medical information demands the highest data protection. MediConnect enforces 256-bit AES encryption, encrypted WebRTC video streams, and immutable audit trails.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {[
                    { icon: UserCheck, label: 'Board-Verified Doctors', sub: 'Manually vetted by clinical admins' },
                    { icon: Lock, label: 'Encrypted Health Vault', sub: 'Only you & your doctor can access' },
                    { icon: FileText, label: 'Immutable Prescriptions', sub: 'Versioned PDF records forever' },
                    { icon: Activity, label: 'Full Audit Logging', sub: 'Every action tracked & traceable' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(13,148,136,0.15)' }}>
                        <Icon className="w-4 h-4 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — checklist card */}
              <div className="flex items-center">
                <div className="w-full rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">Clinical Readiness</p>
                  <ul className="space-y-3">
                    {[
                      'Real-time WebRTC browser consultations — zero plugins required',
                      'Atomic booking locks — no double-scheduling ever',
                      'Immutable versioned prescriptions with signed PDF export',
                      'Role-based access control — patients only see their own data',
                      'Admin audit dashboard with full platform oversight',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/doctors"
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                      boxShadow: '0 4px 16px rgba(13,148,136,0.4)',
                      color: 'white',
                    }}
                  >
                    Schedule a Consultation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Patient Stories</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Trusted by thousands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Emily R.',
                role: 'Patient — General Medicine',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
                quote: 'I got a same-day appointment and had a prescription in my inbox within 30 minutes of the call. This is the future of healthcare.',
                rating: 5,
              },
              {
                name: 'Marcus T.',
                role: 'Patient — Cardiology',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
                quote: 'Dr. Jenkins reviewed my ECG during the video call and caught something three previous doctors missed. Absolutely remarkable.',
                rating: 5,
              },
              {
                name: 'Priya S.',
                role: 'Patient — Pediatrics',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
                quote: 'My son hates clinics. Being able to consult from home with his pediatrician made all the difference — highly recommend.',
                rating: 5,
              },
            ].map(({ name, role, avatar, quote, rating }) => (
              <div key={name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <div className="flex">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{quote}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{name}</p>
                    <p className="text-[11px] text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Support & Answers</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="rounded-3xl p-10 sm:p-14 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)' }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-sm text-teal-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Start your health journey today
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Ready to see a specialist?
              </h2>
              <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Create a free patient account and connect with board-certified physicians in minutes — no insurance paperwork, no waiting rooms.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                    boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
                  }}
                >
                  Find a Doctor <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:border-teal-400 hover:shadow-md transition-all"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
