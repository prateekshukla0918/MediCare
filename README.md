# MediConnect — Smart Healthcare & Telemedicine Platform

MediConnect is a full-stack, enterprise-grade virtual healthcare and telemedicine platform connecting patients with board-verified doctors through appointment scheduling, WebRTC video consultations, digital multi-item prescriptions, electronic health record vaults, clinical follow-ups, and an operational analytics suite.

---

## 🚀 Key Features by User Persona

### 1. 👤 Patient Portal
- **Doctor Discovery:** Filter board-verified specialists by specialization, language, and consultation fee.
- **Atomic Booking:** Real-time availability calculation with atomic transactions to prevent double bookings.
- **Appointment Management:** Tabbed view of Upcoming, Completed, and Cancelled visits with rescheduling and cancellation flows.
- **Telemedicine Consultation Room:** Encrypted WebRTC video calls, microphone/camera controls, and in-call chat directly in the browser.
- **Electronic Health Records (EHR):** Category-based health records vault (Lab Reports, Imaging, Summaries) with validation and delete controls.
- **Digital Prescriptions:** Multi-item prescriptions with dosage, frequency, instructions, and clinical PDF printing/downloading.
- **Follow-Up Care:** Track doctor-recommended follow-up dates and book with 1 click.
- **Health Profile:** Blood group, allergies, chronic conditions, and emergency contacts.

### 2. 🩺 Doctor Portal
- **Clinical Dashboard:** Daily schedule, patient queue, and 1-click consultation launch.
- **Appointment Calendar:** Interactive Day & Week calendar views showing scheduled appointments.
- **Assigned Patient Roster:** Searchable cohort of patients with access to past visits and medical histories.
- **Clinical Patient Chart:** Detailed view of patient allergies, chronic conditions, uploaded lab reports, and previous visits.
- **Prescription Builder:** Interactive multi-item prescription creator with versioning and audit trail.
- **Availability Settings:** Configure working days, working hours, 30-minute slot duration, buffer times, and consultation pricing.
- **Professional Profile:** Medical council registration number, degrees, qualifications, and biography.

### 3. 🛡️ Admin & Operational Analytics Suite
- **System Overview:** Total registered patients, active doctors, pending verifications, appointments today, and cancellation rate.
- **Doctor Verification Queue:** Review submitted medical licenses, registration numbers, and degrees before approving active booking privileges.
- **User Management:** Directory of patients, doctors, and administrators with activation and suspension controls.
- **Appointment Oversight:** Platform-wide appointment search, filter by status, and conflict investigation.
- **Platform Analytics (Page 22 Specification):**
  - **Global Filters:** Date range (7d, 30d, 90d, 365d), Specialization, Consultation Type, and Status.
  - **6 Operational KPIs:** Total Appointments, Completed Consultations, Cancellation Rate (%), Completion Rate (%), Average Time to Appointment (hrs), and Verification Backlog.
  - **5 Recharts Visualizations:**
    1. *Appointment & Consultation Trends* (Line chart)
    2. *Appointment Status Distribution* (Donut chart)
    3. *Popular Specializations Demand* (Bar chart)
    4. *Doctor Caseload & Workload* (Bar chart)
    5. *Registration & Adoption Trends* (Area chart)
  - **CSV Export:** Formula-injection sanitized export (`=`, `+`, `-`, `@` escaped).
- **Security Audit Logs:** Immutable clinical event logs for HIPAA accountability.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, Zod, Socket.IO, JWT, bcryptjs |
| **Database & ORM** | Prisma ORM, SQLite (embedded zero-config for instant demonstration) / PostgreSQL compatible |
| **Real-Time & Media** | Native browser WebRTC API, Socket.IO signaling server |

---

## 🔑 Pre-Seeded Demonstration Accounts

You can switch between any of these roles instantly using the **Role Switcher** dropdown in the top-right navbar:

| Role | Email | Password | Name / Details |
|---|---|---|---|
| **Patient** | `patient@mediconnect.com` | `patient123` | Alex Morgan (Patient with health records & upcoming consult) |
| **Doctor** | `dr.sarah@mediconnect.com` | `doctor123` | Dr. Sarah Jenkins (Cardiologist, Harvard MD, FACC) |
| **Admin** | `admin@mediconnect.com` | `admin123` | Dr. Eleanor Vance (Chief Medical Administrator) |

---

## 💻 Running Locally

### 1. Start Both Frontend and Backend Concurrently
From the project root:
```bash
npm run dev
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5001](http://localhost:5001)

### 2. Reset or Re-Seed Database
```bash
cd server && npx tsx src/seed.ts
```

### 3. Run Automated E2E Test Suite
```bash
cd server && npx tsx test_mediconnect_e2e.ts
```
