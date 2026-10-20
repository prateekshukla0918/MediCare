export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type ConsultationType = 'VIDEO' | 'AUDIO' | 'CLINIC';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  patientProfileId?: string;
  doctorProfileId?: string;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
  address?: string;
  user?: User;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  bufferTime: number;
  isActive: boolean;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string;
  regNumber: string;
  experienceYears: number;
  bio: string;
  fee: number;
  languages: string;
  clinicHospital?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationNotes?: string;
  verificationDoc?: string;
  createdAt?: string;
  user: User;
  availabilities?: DoctorAvailability[];
}

export interface Appointment {
  id: string;
  referenceId: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  symptoms?: string;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
  patient: PatientProfile & { user: User };
  doctor: DoctorProfile & { user: User };
  consultation?: Consultation;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  clinicalNotes?: string;
  diagnosis?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  endedAt?: string;
  prescriptions?: Prescription[];
  followUps?: FollowUp[];
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  referenceNo: string;
  consultationId?: string;
  doctorId: string;
  patientId: string;
  issuedAt: string;
  version: number;
  advice?: string;
  items: PrescriptionItem[];
  doctor: DoctorProfile & { user: User };
  patient: PatientProfile & { user: User };
  consultation?: Consultation & {
    appointment?: { referenceId: string; dateTime: string; consultationType: string };
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  category: 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'DISCHARGE_SUMMARY' | 'OTHER';
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  doctorAccess: boolean;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId?: string;
  recommendedDate: string;
  status: 'PENDING' | 'SCHEDULED' | 'OVERDUE' | 'COMPLETED';
  instructions: string;
  createdAt: string;
  doctor: DoctorProfile & { user: User };
  patient: PatientProfile & { user: User };
  consultation?: Consultation;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'VERIFICATION' | 'SECURITY';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface AnalyticsKPIs {
  totalAppointments: number;
  completedConsultations: number;
  cancellationRate: number;
  completionRate: number;
  avgWaitHours: number;
  verificationBacklog: number;
}
