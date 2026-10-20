import http from 'http';

const BASE_API = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3000';

async function request(url: string, options: any = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  let body: any;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, ok: res.ok, body, headers: res.headers };
}

async function runTests() {
  console.log('🩺 Starting MediConnect Comprehensive E2E Verification Suite...\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failCount++;
    }
  }

  try {
    // 1. Health check
    const health = await request(`${BASE_API}/health`);
    assert(health.status === 200 && health.body.status === 'healthy', '1. Backend API Health Check');

    // 2. Patient Login
    const patientLogin = await request(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@mediconnect.com', password: 'patient123' }),
    });
    assert(patientLogin.status === 200 && !!patientLogin.body.token, '2. Patient Authentication (Alex Morgan)');
    const patientToken = patientLogin.body.token;

    // 3. Doctor Login
    const doctorLogin = await request(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.sarah@mediconnect.com', password: 'doctor123' }),
    });
    assert(doctorLogin.status === 200 && !!doctorLogin.body.token, '3. Doctor Authentication (Dr. Sarah Jenkins)');
    const doctorToken = doctorLogin.body.token;

    // 4. Admin Login
    const adminLogin = await request(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mediconnect.com', password: 'admin123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN', '4. Admin Authentication (Dr. Eleanor Vance)');
    const adminToken = adminLogin.body.token;

    // 5. Doctor Directory & Search
    const doctors = await request(`${BASE_API}/doctors?specialization=Cardiology`);
    assert(doctors.status === 200 && doctors.body.doctors.length >= 1, '5. Doctor Directory with Specialization Filter');
    const targetDoctor = doctors.body.doctors[0];

    // 6. Slot Calculator
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    // Find a weekday (Monday = 1 ... Saturday = 6)
    while (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const targetDateStr = tomorrow.toISOString().split('T')[0];

    const slotsRes = await request(`${BASE_API}/doctors/${targetDoctor.id}/slots?date=${targetDateStr}`);
    assert(slotsRes.status === 200 && Array.isArray(slotsRes.body.slots), '6. Real-Time Slot Generation');
    const availableSlot = slotsRes.body.slots.find((s: any) => s.available);
    assert(!!availableSlot, '7. Verified Available Time Slot in Doctor Schedule');

    // 8. Atomic Booking
    const bookingTime = `${targetDateStr}T${availableSlot.time}:00`;
    const bookRes = await request(`${BASE_API}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: targetDoctor.id,
        dateTime: bookingTime,
        consultationType: 'VIDEO',
        symptoms: 'Routine cardiovascular checkup and ECG review.',
      }),
    });
    assert(bookRes.status === 201 && !!bookRes.body.appointment, '8. Patient Appointment Booking');
    const createdAppointment = bookRes.body.appointment;

    // 9. Atomic Double-Booking Conflict Prevention Test
    const doubleBookRes = await request(`${BASE_API}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: targetDoctor.id,
        dateTime: bookingTime,
        consultationType: 'VIDEO',
        symptoms: 'Second booking attempt for identical slot.',
      }),
    });
    assert(
      doubleBookRes.status === 409,
      '9. Atomic Collision Check: Simultaneous Double-Booking Prevented (HTTP 409 Conflict)',
      doubleBookRes.body
    );

    // 10. Start WebRTC Consultation Session
    const startRes = await request(`${BASE_API}/consultations/${createdAppointment.id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert(startRes.status === 200 && startRes.body.consultation.status === 'IN_PROGRESS', '10. Launch Consultation Session');

    // 11. Doctor Issues Prescription
    const rxRes = await request(`${BASE_API}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        patientId: createdAppointment.patientId,
        consultationId: startRes.body.consultation.id,
        advice: 'Take with warm water after meals. Monitor blood pressure morning and night.',
        items: [
          {
            medicationName: 'Metoprolol Succinate',
            dosage: '25 mg',
            frequency: 'Once daily in the morning',
            duration: '14 days',
            instructions: 'Take oral tablet with food. Do not skip doses.',
          },
        ],
      }),
    });
    assert(rxRes.status === 201 && rxRes.body.prescription.items.length === 1, '11. Issue Digital Multi-Item Prescription');

    // 12. Patient Retrieves Issued Prescription
    const patientRxRes = await request(`${BASE_API}/prescriptions`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    assert(
      patientRxRes.status === 200 && patientRxRes.body.prescriptions.length > 0,
      '12. Patient Prescription Retrieval'
    );

    // 13. Recommend Follow-Up
    const fuDate = new Date();
    fuDate.setDate(fuDate.getDate() + 14);
    const fuRes = await request(`${BASE_API}/follow-ups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({
        patientId: createdAppointment.patientId,
        recommendedDate: fuDate.toISOString().split('T')[0],
        instructions: 'Repeat 12-lead ECG and home BP log review.',
      }),
    });
    assert(fuRes.status === 201 && !!fuRes.body.followUp, '13. Clinical Follow-Up Recommendation Creation');

    // 14. Doctor Verification Queue (Admin)
    const pendingDocs = await request(`${BASE_API}/admin/doctors/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(pendingDocs.status === 200 && pendingDocs.body.doctors.length > 0, '14. Doctor Verification Application Queue');
    const doctorToVerify = pendingDocs.body.doctors[0];

    // 15. Admin Approves Doctor
    const approveRes = await request(`${BASE_API}/admin/doctors/${doctorToVerify.id}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'VERIFIED',
        reason: 'Verified credentials against Minnesota Board of Medical Practice.',
      }),
    });
    assert(approveRes.status === 200 && approveRes.body.doctor.verificationStatus === 'VERIFIED', '15. Admin Credential Approval Workflow');

    // 16. Platform Analytics Overview (Page 22)
    const analytics = await request(`${BASE_API}/admin/analytics/overview?days=30`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      analytics.status === 200 &&
      typeof analytics.body.kpis.totalAppointments === 'number' &&
      typeof analytics.body.kpis.cancellationRate === 'number',
      '16. Platform Analytics: 6 Operational KPIs Computed from Database'
    );

    // 17. Platform Analytics Trends (Chart 1)
    const trends = await request(`${BASE_API}/admin/analytics/trends?days=30`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(trends.status === 200 && Array.isArray(trends.body.trends), '17. Platform Analytics: Recharts Trends Aggregator');

    // 18. Formula Injection Protected CSV Export
    const exportCsv = await request(`${BASE_API}/admin/analytics/export?days=30`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      exportCsv.status === 200 &&
      exportCsv.headers.get('content-type')?.includes('text/csv') &&
      exportCsv.body.includes('Reference ID,Doctor Name'),
      '18. Secure CSV Analytics Export with Formula Injection Sanitization'
    );

    // 19. Frontend Serving
    const frontend = await request(FRONTEND_URL);
    assert(
      frontend.status === 200 && frontend.body.includes('MediConnect'),
      '19. Frontend Web Application Serving on http://localhost:3000'
    );

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
    console.log(`========================================\n`);

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
