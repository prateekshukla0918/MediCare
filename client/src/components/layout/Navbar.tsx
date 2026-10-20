import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Bell, 
  Calendar, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  CheckCircle, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  ChevronDown,
  Users,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(event.target as Node)) {
        setShowDemoMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (role: UserRole) => {
    setShowDemoMenu(false);
    await switchDemoUser(role);
    if (role === 'PATIENT') navigate('/patient/dashboard');
    else if (role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (role === 'ADMIN') navigate('/admin/overview');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                  Medi<span className="text-teal-600">Connect</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-teal-700 tracking-widest -mt-1">
                  Telemedicine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links based on Role */}
            <nav className="hidden md:flex items-center space-x-1">
              {!user && (
                <>
                  <Link 
                    to="/doctors" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctors') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Find Doctors
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/how-it-works') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    How It Works
                  </Link>
                  <Link 
                    to="/about" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/about') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    About Us
                  </Link>
                </>
              )}

              {user?.role === 'PATIENT' && (
                <>
                  <Link 
                    to="/patient/dashboard" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/patient/dashboard') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/doctors" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctors') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Find Doctors
                  </Link>
                  <Link 
                    to="/patient/appointments" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/patient/appointments') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link 
                    to="/patient/records" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/patient/records') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Medical Records
                  </Link>
                  <Link 
                    to="/patient/prescriptions" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/patient/prescriptions') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Prescriptions
                  </Link>
                  <Link 
                    to="/patient/follow-ups" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/patient/follow-ups') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Follow-Ups
                  </Link>
                </>
              )}

              {user?.role === 'DOCTOR' && (
                <>
                  <Link 
                    to="/doctor/dashboard" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/dashboard') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/doctor/calendar" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/calendar') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Schedule & Calendar
                  </Link>
                  <Link 
                    to="/doctor/patients" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/patients') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Patient List
                  </Link>
                  <Link 
                    to="/doctor/prescriptions" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/prescriptions') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Prescriptions
                  </Link>
                  <Link 
                    to="/doctor/availability" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/availability') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Availability
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link 
                    to="/admin/overview" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/overview') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link 
                    to="/admin/verification" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/verification') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Doctor Verification
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/users') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/appointments" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/appointments') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link 
                    to="/admin/analytics" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/analytics') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Analytics
                  </Link>
                  <Link 
                    to="/admin/audit-logs" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/audit-logs') ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Audit Logs
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Section: Role Switcher Demo, Notifications, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Switcher Pill */}
            <div className="relative" ref={demoMenuRef}>
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors shadow-sm"
                title="Switch between Patient, Doctor, and Admin for live testing"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span>Role: <strong>{user?.role || 'Guest'}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Switcher
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('PATIENT')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>👤 Patient (Alex Morgan)</span>
                    {user?.role === 'PATIENT' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('DOCTOR')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🩺 Doctor (Dr. Sarah Jenkins)</span>
                    {user?.role === 'DOCTOR' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                  >
                    <span>🛡️ Admin (Dr. Eleanor Vance)</span>
                    {user?.role === 'ADMIN' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-left flex gap-3 ${
                              !n.isRead ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="mt-0.5">
                              {n.type === 'APPOINTMENT' && <Calendar className="w-4 h-4 text-teal-600" />}
                              {n.type === 'PRESCRIPTION' && <FileText className="w-4 h-4 text-blue-600" />}
                              {n.type === 'FOLLOW_UP' && <Clock className="w-4 h-4 text-amber-600" />}
                              {n.type === 'VERIFICATION' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                              {n.type === 'SECURITY' && <Activity className="w-4 h-4 text-slate-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 self-center"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/20"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={user.role === 'PATIENT' ? '/patient/profile' : user.role === 'DOCTOR' ? '/doctor/profile' : '/admin/overview'}
                      onClick={() => setShowUserMenu(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all hover:scale-102"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {!user && (
            <>
              <Link to="/doctors" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Find Doctors</Link>
              <Link to="/how-it-works" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">How It Works</Link>
              <Link to="/about" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">About Us</Link>
              <Link to="/auth?mode=login" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-teal-600 font-semibold">Log In</Link>
            </>
          )}

          {user?.role === 'PATIENT' && (
            <>
              <Link to="/patient/dashboard" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Dashboard</Link>
              <Link to="/doctors" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Find Doctors</Link>
              <Link to="/patient/appointments" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Appointments</Link>
              <Link to="/patient/records" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Medical Records</Link>
              <Link to="/patient/prescriptions" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Prescriptions</Link>
              <Link to="/patient/follow-ups" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Follow-Ups</Link>
            </>
          )}

          {user?.role === 'DOCTOR' && (
            <>
              <Link to="/doctor/dashboard" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Dashboard</Link>
              <Link to="/doctor/calendar" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Calendar</Link>
              <Link to="/doctor/patients" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Patients</Link>
              <Link to="/doctor/prescriptions" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Prescriptions</Link>
              <Link to="/doctor/availability" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Availability</Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link to="/admin/overview" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Admin Overview</Link>
              <Link to="/admin/verification" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Doctor Verification</Link>
              <Link to="/admin/users" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Users</Link>
              <Link to="/admin/appointments" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Appointments</Link>
              <Link to="/admin/analytics" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Analytics</Link>
              <Link to="/admin/audit-logs" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-slate-700">Audit Logs</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
