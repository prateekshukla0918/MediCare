import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const doctorPass = await bcrypt.hash('doctor123', salt);
  const patientPass = await bcrypt.hash('patient123', salt);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Eleanor Vance (Chief Admin)',
      email: 'admin@mediconnect.com',
      passwordHash: adminPass,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+1 (555) 019-2831',
    },
  });

  // 2. Doctors
  const docSarahUser = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'dr.sarah@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'ACTIVE',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docSarah = await prisma.doctorProfile.create({
    data: {
      userId: docSarahUser.id,
      specialization: 'Cardiology',
      qualifications: 'MD, FACC - Harvard Medical School',
      regNumber: 'MED-MA-88492',
      experienceYears: 14,
      bio: 'Board-certified cardiologist with over 14 years of clinical experience specializing in preventive cardiology, hypertension, arrhythmia, and comprehensive cardiac care.',
      fee: 120,
      languages: 'English, Spanish',
      clinicHospital: 'Boston Cardiovascular Center',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Credentials verified with Massachusetts Medical Board.',
    },
  });

  const docAravindUser = await prisma.user.create({
    data: {
      name: 'Dr. Aravind Patel',
      email: 'dr.aravind@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'ACTIVE',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docAravind = await prisma.doctorProfile.create({
    data: {
      userId: docAravindUser.id,
      specialization: 'Dermatology',
      qualifications: 'MD, FAAD - Johns Hopkins University',
      regNumber: 'MED-NY-51209',
      experienceYears: 11,
      bio: 'Dermatologist dedicated to precision medical dermatology, eczema management, adult and pediatric acne treatment, and skin cancer surveillance.',
      fee: 95,
      languages: 'English, Hindi, Gujarati',
      clinicHospital: 'Manhattan Skin & Laser Institute',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Active license confirmed with New York State Board.',
    },
  });

  const docMarcusUser = await prisma.user.create({
    data: {
      name: 'Dr. Marcus Chen',
      email: 'dr.marcus@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'ACTIVE',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docMarcus = await prisma.doctorProfile.create({
    data: {
      userId: docMarcusUser.id,
      specialization: 'Neurology',
      qualifications: 'MD, PhD - Stanford University School of Medicine',
      regNumber: 'MED-CA-99318',
      experienceYears: 16,
      bio: 'Senior neurologist focusing on complex migraine disorders, sleep disturbance, neuropathy management, and neuro-rehabilitation.',
      fee: 150,
      languages: 'English, Mandarin',
      clinicHospital: 'San Francisco Neurological Clinic',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Board certification validated by ABPN.',
    },
  });

  const docPriyaUser = await prisma.user.create({
    data: {
      name: 'Dr. Priya Sharma',
      email: 'dr.priya@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'ACTIVE',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1594824813590-7813a34a81d0?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docPriya = await prisma.doctorProfile.create({
    data: {
      userId: docPriyaUser.id,
      specialization: 'Pediatrics',
      qualifications: 'MD, FAAP - AIIMS & Boston Children’s Hospital',
      regNumber: 'MED-MA-44211',
      experienceYears: 9,
      bio: 'Compassionate pediatrician specializing in newborn care, developmental assessments, childhood allergies, and adolescent preventative medicine.',
      fee: 85,
      languages: 'English, Hindi',
      clinicHospital: 'Children’s Wellness Pavilion',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Certified by American Board of Pediatrics.',
    },
  });

  const docEmilyUser = await prisma.user.create({
    data: {
      name: 'Dr. Emily Taylor',
      email: 'dr.emily@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'ACTIVE',
      phone: '+1 (555) 678-9012',
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docEmily = await prisma.doctorProfile.create({
    data: {
      userId: docEmilyUser.id,
      specialization: 'General Medicine',
      qualifications: 'MD, ABFM - University of Washington',
      regNumber: 'MED-WA-12401',
      experienceYears: 12,
      bio: 'Primary care clinician focused on holistic family medicine, chronic disease prevention, lifestyle wellness, and rapid health consultations.',
      fee: 75,
      languages: 'English, French',
      clinicHospital: 'Seattle Family Health Center',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Verified via Washington Medical Quality Assurance.',
    },
  });

  // Pending Doctor 1 (for Admin Verification demonstration)
  const docRobertUser = await prisma.user.create({
    data: {
      name: 'Dr. Robert Miller',
      email: 'dr.robert@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'PENDING',
      phone: '+1 (555) 789-0123',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    },
  });

  const docRobert = await prisma.doctorProfile.create({
    data: {
      userId: docRobertUser.id,
      specialization: 'Orthopedics',
      qualifications: 'MS Ortho, FAAOS - Mayo Clinic College of Medicine',
      regNumber: 'MED-MN-77123',
      experienceYears: 8,
      bio: 'Orthopedic specialist focused on joint preservation, sports injury rehabilitation, and minimally invasive musculoskeletal care.',
      fee: 130,
      languages: 'English',
      clinicHospital: 'Midwest Orthopedic Center',
      verificationStatus: 'PENDING',
      verificationNotes: 'Pending credential review of Board certification documents.',
      verificationDoc: 'medical_license_mn_77123.pdf',
    },
  });

  // Pending Doctor 2
  const docAliciaUser = await prisma.user.create({
    data: {
      name: 'Dr. Alicia Gomez',
      email: 'dr.alicia@mediconnect.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      status: 'PENDING',
      phone: '+1 (555) 890-1234',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    },
  });

  await prisma.doctorProfile.create({
    data: {
      userId: docAliciaUser.id,
      specialization: 'Psychiatry',
      qualifications: 'MD, Board Certified - Columbia University',
      regNumber: 'MED-NY-33819',
      experienceYears: 10,
      bio: 'Psychiatrist offering personalized treatment for anxiety, depression, and stress management with evidence-based telemedicine therapy.',
      fee: 110,
      languages: 'English, Spanish',
      clinicHospital: 'Columbia Center for Behavioral Health',
      verificationStatus: 'PENDING',
      verificationNotes: 'Submitted medical license and malpractice insurance copy.',
      verificationDoc: 'license_columbia_psych_33819.pdf',
    },
  });

  // Add Availability for verified doctors (Mon-Sat, 9am - 5pm)
  const verifiedDoctors = [docSarah, docAravind, docMarcus, docPriya, docEmily];
  for (const doc of verifiedDoctors) {
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          bufferTime: 10,
          isActive: true,
        },
      });
    }
  }

  // 3. Patients
  const patientAlexUser = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'patient@mediconnect.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE',
      phone: '+1 (555) 912-3456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
  });

  const patientAlex = await prisma.patientProfile.create({
    data: {
      userId: patientAlexUser.id,
      dob: '1992-05-14',
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: 'Penicillin, Peanuts',
      chronicConditions: 'Mild Asthma, Stage 1 Hypertension',
      emergencyContact: 'Rachel Morgan (+1 555-912-8877)',
      address: '742 Evergreen Terrace, Boston, MA',
    },
  });

  const patientSophiaUser = await prisma.user.create({
    data: {
      name: 'Sophia Rodriguez',
      email: 'patient2@mediconnect.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE',
      phone: '+1 (555) 123-9876',
    },
  });

  const patientSophia = await prisma.patientProfile.create({
    data: {
      userId: patientSophiaUser.id,
      dob: '1988-11-20',
      gender: 'Female',
      bloodGroup: 'A+',
      allergies: 'None recorded',
      chronicConditions: 'Chronic Migraine',
      emergencyContact: 'Carlos Rodriguez (+1 555-123-4455)',
      address: '120 West 44th St, New York, NY',
    },
  });

  const patientDavidUser = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'patient3@mediconnect.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE',
      phone: '+1 (555) 321-6540',
    },
  });

  const patientDavid = await prisma.patientProfile.create({
    data: {
      userId: patientDavidUser.id,
      dob: '1995-03-08',
      gender: 'Male',
      bloodGroup: 'B+',
      allergies: 'Sulfa antibiotics',
      chronicConditions: 'Type 2 Diabetes (Well-controlled)',
      emergencyContact: 'Grace Kim (+1 555-321-9988)',
      address: '408 Pine Street, Seattle, WA',
    },
  });

  // 4. Appointments & Consultations
  const now = new Date();
  
  // A) Today's upcoming consultation: Alex Morgan with Dr. Sarah Jenkins
  const todayUpcoming = new Date(now.getTime() + 30 * 60 * 1000); // in 30 mins
  const todayUpcomingEnd = new Date(todayUpcoming.getTime() + 30 * 60 * 1000);

  const apptToday = await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-9041',
      patientId: patientAlex.id,
      doctorId: docSarah.id,
      dateTime: todayUpcoming,
      endTime: todayUpcomingEnd,
      status: 'CONFIRMED',
      consultationType: 'VIDEO',
      symptoms: 'Follow-up on elevated blood pressure and chest tightness after exercise.',
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: apptToday.id,
      doctorId: docSarah.id,
      patientId: patientAlex.id,
      status: 'SCHEDULED',
      clinicalNotes: 'Intake: Patient reported occasional morning dizziness. Resting BP: 138/88.',
    },
  });

  // B) Tomorrow's appointment: Sophia Rodriguez with Dr. Marcus Chen
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(14, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow.getTime() + 30 * 60 * 1000);

  await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-9042',
      patientId: patientSophia.id,
      doctorId: docMarcus.id,
      dateTime: tomorrow,
      endTime: tomorrowEnd,
      status: 'CONFIRMED',
      consultationType: 'VIDEO',
      symptoms: 'Frequent migraine episodes with visual auras on weekday mornings.',
    },
  });

  // C) In 3 days: David Kim with Dr. Emily Taylor
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  in3Days.setHours(10, 30, 0, 0);
  const in3DaysEnd = new Date(in3Days.getTime() + 30 * 60 * 1000);

  await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-9043',
      patientId: patientDavid.id,
      doctorId: docEmily.id,
      dateTime: in3Days,
      endTime: in3DaysEnd,
      status: 'CONFIRMED',
      consultationType: 'VIDEO',
      symptoms: 'Quarterly HbA1c review and continuous glucose monitoring calibration.',
    },
  });

  // D) Completed Consultation (5 days ago): Alex Morgan with Dr. Sarah Jenkins
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  fiveDaysAgo.setHours(11, 0, 0, 0);
  const fiveDaysAgoEnd = new Date(fiveDaysAgo.getTime() + 30 * 60 * 1000);

  const pastAppt1 = await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-8810',
      patientId: patientAlex.id,
      doctorId: docSarah.id,
      dateTime: fiveDaysAgo,
      endTime: fiveDaysAgoEnd,
      status: 'COMPLETED',
      consultationType: 'VIDEO',
      symptoms: 'Initial cardiovascular evaluation and lipid profile consultation.',
    },
  });

  const pastConsultation1 = await prisma.consultation.create({
    data: {
      appointmentId: pastAppt1.id,
      doctorId: docSarah.id,
      patientId: patientAlex.id,
      clinicalNotes: 'Patient presents with borderline hyperlipidemia (LDL 158 mg/dL) and Stage 1 systolic hypertension. Advised dietary modifications, 150 min/wk aerobic exercise, and initiated low-dose statin + ACE inhibitor.',
      diagnosis: 'Primary Essential Hypertension & Mild Hypercholesterolemia',
      status: 'COMPLETED',
      startedAt: fiveDaysAgo,
      endedAt: fiveDaysAgoEnd,
    },
  });

  // Prescription for past consultation
  const rx1 = await prisma.prescription.create({
    data: {
      referenceNo: 'RX-2026-7731',
      consultationId: pastConsultation1.id,
      doctorId: docSarah.id,
      patientId: patientAlex.id,
      version: 1,
      advice: 'Take medications strictly with or after meals. Maintain daily home BP log. Reduce sodium intake < 2g/day.',
      issuedAt: fiveDaysAgoEnd,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx1.id,
        medicationName: 'Atorvastatin Calcium',
        dosage: '20 mg',
        frequency: 'Once daily at bedtime',
        duration: '30 days',
        instructions: 'Take oral tablet after dinner. Avoid grapefruit juice.',
      },
      {
        prescriptionId: rx1.id,
        medicationName: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily in the morning',
        duration: '30 days',
        instructions: 'Take in the morning with a full glass of water. Report persistent dry cough.',
      },
    ],
  });

  // Follow-up for Alex Morgan
  const followUpDate = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
  await prisma.followUp.create({
    data: {
      patientId: patientAlex.id,
      doctorId: docSarah.id,
      consultationId: pastConsultation1.id,
      recommendedDate: followUpDate,
      status: 'PENDING',
      instructions: 'Repeat basic metabolic panel and home BP review after 2 weeks of Lisinopril.',
    },
  });

  // E) Past Completed Consultation for Sophia with Dr. Aravind Patel
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  tenDaysAgo.setHours(15, 0, 0, 0);
  const tenDaysAgoEnd = new Date(tenDaysAgo.getTime() + 30 * 60 * 1000);

  const pastAppt2 = await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-8742',
      patientId: patientSophia.id,
      doctorId: docAravind.id,
      dateTime: tenDaysAgo,
      endTime: tenDaysAgoEnd,
      status: 'COMPLETED',
      consultationType: 'VIDEO',
      symptoms: 'Persistent contact dermatitis flare-up on forearms.',
    },
  });

  const pastConsultation2 = await prisma.consultation.create({
    data: {
      appointmentId: pastAppt2.id,
      doctorId: docAravind.id,
      patientId: patientSophia.id,
      clinicalNotes: 'Erythematous papules consistent with acute allergic contact dermatitis. Recommended topical corticosteroid and fragrance-free barrier cream.',
      diagnosis: 'Acute Contact Dermatitis',
      status: 'COMPLETED',
      startedAt: tenDaysAgo,
      endedAt: tenDaysAgoEnd,
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      referenceNo: 'RX-2026-6649',
      consultationId: pastConsultation2.id,
      doctorId: docAravind.id,
      patientId: patientSophia.id,
      version: 1,
      advice: 'Apply thin layer only to affected skin areas. Do not cover with occlusive dressing.',
      issuedAt: tenDaysAgoEnd,
    },
  });

  await prisma.prescriptionItem.create({
    data: {
      prescriptionId: rx2.id,
      medicationName: 'Hydrocortisone Butyrate Cream 0.1%',
      dosage: 'Topical Application',
      frequency: 'Twice daily',
      duration: '10 days',
      instructions: 'Apply gently over affected lesions morning and evening.',
    },
  });

  // F) Cancelled Appointment (for analytics testing)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  await prisma.appointment.create({
    data: {
      referenceId: 'APT-2026-8902',
      patientId: patientDavid.id,
      doctorId: docSarah.id,
      dateTime: twoDaysAgo,
      endTime: new Date(twoDaysAgo.getTime() + 30 * 60 * 1000),
      status: 'CANCELLED',
      consultationType: 'VIDEO',
      symptoms: 'Routine checkup.',
      cancelReason: 'Work travel schedule conflict',
      cancelledBy: 'Patient',
    },
  });

  // Historical appointments spread over the past 30 days for rich Analytics charts
  const specialties = [
    { doc: docSarah, spec: 'Cardiology' },
    { doc: docAravind, spec: 'Dermatology' },
    { doc: docMarcus, spec: 'Neurology' },
    { doc: docPriya, spec: 'Pediatrics' },
    { doc: docEmily, spec: 'General Medicine' },
  ];

  for (let i = 1; i <= 25; i++) {
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const apptDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    apptDate.setHours(9 + (i % 8), 0, 0, 0);
    const chosenDoc = specialties[i % specialties.length].doc;
    const chosenPatient = i % 2 === 0 ? patientSophia : patientDavid;
    const isCompleted = i % 4 !== 0;
    const status = isCompleted ? 'COMPLETED' : (i % 8 === 0 ? 'CANCELLED' : 'NO_SHOW');

    await prisma.appointment.create({
      data: {
        referenceId: `APT-HIST-${1000 + i}`,
        patientId: chosenPatient.id,
        doctorId: chosenDoc.id,
        dateTime: apptDate,
        endTime: new Date(apptDate.getTime() + 30 * 60 * 1000),
        status: status,
        consultationType: i % 3 === 0 ? 'AUDIO' : 'VIDEO',
        symptoms: 'Periodic telemedicine clinical review.',
        cancelReason: status === 'CANCELLED' ? 'Patient requested rescheduling' : null,
      },
    });
  }

  // 5. Medical Records for Alex Morgan
  await prisma.medicalRecord.createMany({
    data: [
      {
        patientId: patientAlex.id,
        title: 'Comprehensive Lipid & Metabolic Panel',
        category: 'LAB_REPORT',
        fileUrl: '/uploads/records/lipid_panel_2026.pdf',
        fileName: 'Lipid_Panel_Nov2026.pdf',
        fileSize: '1.4 MB',
        uploadedBy: 'Boston Diagnostic Labs',
        doctorAccess: true,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientAlex.id,
        title: '12-Lead Resting Electrocardiogram (ECG)',
        category: 'IMAGING',
        fileUrl: '/uploads/records/resting_ecg_trace.pdf',
        fileName: 'ECG_Trace_Report.pdf',
        fileSize: '2.1 MB',
        uploadedBy: 'Dr. Sarah Jenkins',
        doctorAccess: true,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patientAlex.id,
        title: 'Pulmonary Function Spirometry Report',
        category: 'LAB_REPORT',
        fileUrl: '/uploads/records/spirometry_asthma.pdf',
        fileName: 'Asthma_Spirometry_Exam.pdf',
        fileSize: '890 KB',
        uploadedBy: 'Alex Morgan',
        doctorAccess: true,
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 6. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patientAlexUser.id,
        title: 'Upcoming Video Consultation',
        message: 'Your video consultation with Dr. Sarah Jenkins is scheduled today at ' + todayUpcoming.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'APPOINTMENT',
        link: '/patient/appointments',
        isRead: false,
      },
      {
        userId: patientAlexUser.id,
        title: 'New Digital Prescription Issued',
        message: 'Dr. Sarah Jenkins has issued prescription RX-2026-7731 for Atorvastatin & Lisinopril.',
        type: 'PRESCRIPTION',
        link: '/patient/prescriptions',
        isRead: true,
      },
      {
        userId: docSarahUser.id,
        title: 'New Confirmed Appointment',
        message: 'Alex Morgan has scheduled an appointment for cardiovascular evaluation today.',
        type: 'APPOINTMENT',
        link: '/doctor/appointments',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Doctor Verification Required',
        message: 'Dr. Robert Miller and Dr. Alicia Gomez have submitted applications awaiting verification.',
        type: 'VERIFICATION',
        link: '/admin/verification',
        isRead: false,
      },
    ],
  });

  // 7. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        actorName: 'Dr. Eleanor Vance (Chief Admin)',
        action: 'VERIFY_DOCTOR',
        resource: 'DoctorProfile',
        resourceId: docSarah.id,
        details: 'Approved credentials for Dr. Sarah Jenkins (Cardiology).',
      },
      {
        actorId: docSarahUser.id,
        actorName: 'Dr. Sarah Jenkins',
        action: 'ISSUE_PRESCRIPTION',
        resource: 'Prescription',
        resourceId: rx1.id,
        details: 'Issued digital prescription RX-2026-7731 to patient Alex Morgan.',
      },
    ],
  });

  console.log('✅ Database successfully seeded with rich healthcare records!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
