import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, UserCheck, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualifications, setQualifications] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [consent, setConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!consent) {
      setError('Please agree to the Telemedicine Consent and Terms of Service');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email: registerEmail,
        password,
        phone,
        role,
        specialization: role === 'DOCTOR' ? specialization : undefined,
        qualifications: role === 'DOCTOR' ? qualifications : undefined,
        regNumber: role === 'DOCTOR' ? regNumber : undefined,
      });

      if (role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = async (demoRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoUser(demoRole);
      if (demoRole === 'PATIENT') navigate('/patient/dashboard');
      else if (demoRole === 'DOCTOR') navigate('/doctor/dashboard');
      else if (demoRole === 'ADMIN') navigate('/admin/overview');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Icon & Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome back to MediConnect' : 'Create your account'}
          </h1>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access your virtual consultations and medical records'
              : 'Join as a patient or submit credentials as a doctor'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="p-1 rounded-2xl bg-slate-200/70 grid grid-cols-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forms Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to demo registered email.')}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Account Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">I am joining as a:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PATIENT')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'PATIENT'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('DOCTOR')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'DOCTOR'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Doctor</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'DOCTOR' ? 'Dr. First Last' : 'First Last'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                />
              </div>

              {/* Doctor Specific Fields */}
              {role === 'DOCTOR' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Medical Degrees</label>
                      <input
                        type="text"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        placeholder="MD, MBBS"
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">License / Reg #</label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="REG-12345"
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Confirm</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Telemedicine Consent */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to MediConnect’s Telemedicine Informed Consent, Terms of Service, and Privacy Policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              1-Click Instant Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemo('PATIENT')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-[11px] font-bold text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors text-center"
              >
                👤 Patient
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('DOCTOR')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-[11px] font-bold text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors text-center"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('ADMIN')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-[11px] font-bold text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors text-center"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
