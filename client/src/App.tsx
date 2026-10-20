import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FindDoctorsPage } from './pages/public/FindDoctorsPage';
import { DoctorProfilePage } from './pages/public/DoctorProfilePage';
import { AuthPage } from './pages/public/AuthPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage';
import { MedicalRecordsPage } from './pages/patient/MedicalRecordsPage';
import { PrescriptionsPage } from './pages/patient/PrescriptionsPage';
import { FollowUpsPage } from './pages/patient/FollowUpsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AppointmentCalendarPage } from './pages/doctor/AppointmentCalendarPage';
import { PatientListPage } from './pages/doctor/PatientListPage';
import { PatientDetailsPage } from './pages/doctor/PatientDetailsPage';
import { DoctorPrescriptionsPage } from './pages/doctor/DoctorPrescriptionsPage';
import { AvailabilitySettingsPage } from './pages/doctor/AvailabilitySettingsPage';
import { DoctorProfilePage as DoctorProfileSettingsPage } from './pages/doctor/DoctorProfilePage';

// Shared Telemedicine Room
import { ConsultationRoomPage } from './pages/consultation/ConsultationRoomPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { DoctorVerificationPage } from './pages/admin/DoctorVerificationPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AppointmentManagementPage } from './pages/admin/AppointmentManagementPage';
import { PlatformAnalyticsPage } from './pages/admin/PlatformAnalyticsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { UserRole } from './types';

// Role Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/doctors" element={<FindDoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Patient Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <MyAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/records"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <PrescriptionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/follow-ups"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <FollowUpsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/profile"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                      <PatientProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/calendar"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AppointmentCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <PatientDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorPrescriptionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/availability"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AvailabilitySettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/profile"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <DoctorProfileSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Telemedicine Consultation Room */}
                <Route
                  path="/consultation/:appointmentId"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                      <ConsultationRoomPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/overview"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DoctorVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AppointmentManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <PlatformAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
