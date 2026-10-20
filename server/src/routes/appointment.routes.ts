import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  dateTime: z.string().min(1, 'Date and time is required'),
  consultationType: z.enum(['VIDEO', 'AUDIO', 'CLINIC']).default('VIDEO'),
  symptoms: z.string().optional(),
});

// List appointments (role-scoped)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, role } = req.query;
    const userRole = req.user!.role;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (userRole === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found' });
        return;
      }
      where.patientId = patient.id;
    } else if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!doctor) {
        res.status(404).json({ error: 'Doctor profile not found' });
        return;
      }
      where.doctorId = doctor.id;
    }
    // If ADMIN, sees all appointments

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        consultation: {
          select: { id: true, status: true, clinicalNotes: true, diagnosis: true },
        },
      },
    });

    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
});

// Get single appointment details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
            medicalRecords: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        consultation: {
          include: {
            prescriptions: {
              include: { items: true },
            },
            followUps: true,
          },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Role-based record protection
    const userRole = req.user!.role;
    if (userRole === 'PATIENT' && appointment.patient.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized: You cannot access another patient’s appointment' });
      return;
    }
    if (userRole === 'DOCTOR' && appointment.doctor.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized: You cannot access an unrelated doctor’s appointment' });
      return;
    }

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve appointment details' });
  }
});

// Book new appointment (atomic conflict check)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createAppointmentSchema.parse(req.body);

    // Ensure user has a patient profile
    let patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!patient) {
      if (req.user!.role === 'PATIENT') {
        patient = await prisma.patientProfile.create({
          data: { userId: req.user!.id },
        });
      } else {
        res.status(400).json({ error: 'Only registered patients can book consultations' });
        return;
      }
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: data.doctorId },
      include: { user: true },
    });

    if (!doctor || doctor.verificationStatus !== 'VERIFIED') {
      res.status(400).json({ error: 'Selected doctor is not available for bookings' });
      return;
    }

    const apptDateTime = new Date(data.dateTime);
    if (isNaN(apptDateTime.getTime()) || apptDateTime <= new Date()) {
      res.status(400).json({ error: 'Appointment must be scheduled for a future time' });
      return;
    }

    const durationMinutes = 30;
    const apptEndTime = new Date(apptDateTime.getTime() + durationMinutes * 60 * 1000);

    // ATOMIC TRANSACTION: Check for conflicting booking and create atomically
    const result = await prisma.$transaction(async (tx) => {
      // Find any overlapping active appointment for this doctor
      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          status: { in: ['CONFIRMED', 'PENDING', 'IN_PROGRESS'] },
          OR: [
            {
              dateTime: {
                lt: apptEndTime,
              },
              endTime: {
                gt: apptDateTime,
              },
            },
          ],
        },
      });

      if (conflict) {
        throw new Error('SLOT_CONFLICT: This time slot was just booked by another patient. Please select another slot.');
      }

      const referenceId = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newAppointment = await tx.appointment.create({
        data: {
          referenceId,
          patientId: patient!.id,
          doctorId: data.doctorId,
          dateTime: apptDateTime,
          endTime: apptEndTime,
          status: 'CONFIRMED',
          consultationType: data.consultationType,
          symptoms: data.symptoms,
        },
      });

      // Create linked consultation entry
      await tx.consultation.create({
        data: {
          appointmentId: newAppointment.id,
          doctorId: data.doctorId,
          patientId: patient!.id,
          status: 'SCHEDULED',
        },
      });

      // Notification for Doctor
      await tx.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Appointment Booked',
          message: `${req.user!.name} booked an appointment for ${apptDateTime.toLocaleDateString()} at ${apptDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'APPOINTMENT',
          link: '/doctor/appointments',
        },
      });

      // Notification for Patient
      await tx.notification.create({
        data: {
          userId: req.user!.id,
          title: 'Appointment Confirmed',
          message: `Your appointment with ${doctor.user.name} is confirmed for ${apptDateTime.toLocaleDateString()} at ${apptDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'APPOINTMENT',
          link: '/patient/appointments',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: 'BOOK_APPOINTMENT',
          resource: 'Appointment',
          resourceId: newAppointment.id,
          details: `Booked appointment ${referenceId} with ${doctor.user.name}.`,
        },
      });

      return newAppointment;
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: result,
    });
  } catch (err: any) {
    if (err.message && err.message.startsWith('SLOT_CONFLICT')) {
      res.status(409).json({ error: err.message.replace('SLOT_CONFLICT: ', '') });
      return;
    }
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Internal server error while booking appointment' });
  }
});

// Reschedule appointment (atomic release and re-reservation)
router.patch('/:id/reschedule', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newDateTime } = req.body;
    if (!newDateTime) {
      res.status(400).json({ error: 'New date and time required' });
      return;
    }

    const apptId = req.params.id;
    const targetDate = new Date(newDateTime);

    if (isNaN(targetDate.getTime()) || targetDate <= new Date()) {
      res.status(400).json({ error: 'New appointment time must be in the future' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: apptId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.status === 'COMPLETED') {
      res.status(400).json({ error: 'Completed appointments cannot be rescheduled' });
      return;
    }

    const isPatient = appointment.patient.userId === req.user!.id;
    const isDoctor = appointment.doctor.userId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized to reschedule this appointment' });
      return;
    }

    const duration = 30 * 60 * 1000;
    const targetEnd = new Date(targetDate.getTime() + duration);

    // Atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Check conflict for new slot (excluding current appointment id)
      const conflict = await tx.appointment.findFirst({
        where: {
          id: { not: apptId },
          doctorId: appointment.doctorId,
          status: { in: ['CONFIRMED', 'PENDING', 'IN_PROGRESS'] },
          dateTime: { lt: targetEnd },
          endTime: { gt: targetDate },
        },
      });

      if (conflict) {
        throw new Error('SLOT_CONFLICT: The chosen new time slot is no longer available.');
      }

      const resched = await tx.appointment.update({
        where: { id: apptId },
        data: {
          dateTime: targetDate,
          endTime: targetEnd,
          status: 'CONFIRMED',
        },
      });

      // Notify the other party
      const notifyUserId = isPatient ? appointment.doctor.user.id : appointment.patient.user.id;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          title: 'Appointment Rescheduled',
          message: `Appointment ${appointment.referenceId} was rescheduled to ${targetDate.toLocaleDateString()} at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${req.user!.name}.`,
          type: 'APPOINTMENT',
          link: isPatient ? '/doctor/appointments' : '/patient/appointments',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: 'RESCHEDULE_APPOINTMENT',
          resource: 'Appointment',
          resourceId: apptId,
          details: `Rescheduled from ${appointment.dateTime.toISOString()} to ${targetDate.toISOString()}`,
        },
      });

      return resched;
    });

    res.json({ message: 'Appointment rescheduled successfully', appointment: updated });
  } catch (err: any) {
    if (err.message && err.message.startsWith('SLOT_CONFLICT')) {
      res.status(409).json({ error: err.message.replace('SLOT_CONFLICT: ', '') });
      return;
    }
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const apptId = req.params.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: apptId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.status === 'COMPLETED') {
      res.status(400).json({ error: 'Cannot cancel an already completed appointment' });
      return;
    }

    const isPatient = appointment.patient.userId === req.user!.id;
    const isDoctor = appointment.doctor.userId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
      return;
    }

    const cancelledBy = isPatient ? 'Patient' : isDoctor ? 'Doctor' : 'Administrator';

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id: apptId },
        data: {
          status: 'CANCELLED',
          cancelReason: reason || 'Cancelled by user',
          cancelledBy,
        },
      });

      // Notify other party
      const notifyUserId = isPatient ? appointment.doctor.user.id : appointment.patient.user.id;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          title: 'Appointment Cancelled',
          message: `Appointment ${appointment.referenceId} was cancelled by ${req.user!.name}. Reason: ${reason || 'Not specified'}.`,
          type: 'APPOINTMENT',
          link: isPatient ? '/doctor/appointments' : '/patient/appointments',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: 'CANCEL_APPOINTMENT',
          resource: 'Appointment',
          resourceId: apptId,
          details: `Cancelled by ${cancelledBy}. Reason: ${reason || 'None provided'}`,
        },
      });

      return appt;
    });

    res.json({ message: 'Appointment cancelled successfully', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
