import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Start consultation (sets status to IN_PROGRESS)
router.post('/:appointmentId/start', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const isPatient = appointment.patient.userId === req.user!.id;
    const isDoctor = appointment.doctor.userId === req.user!.id;

    if (!isPatient && !isDoctor && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to enter this consultation' });
      return;
    }

    if (appointment.status === 'CANCELLED') {
      res.status(400).json({ error: 'Cannot start a cancelled appointment' });
      return;
    }

    let consultation = appointment.consultation;
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    } else if (consultation.status !== 'COMPLETED') {
      consultation = await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: consultation.startedAt || new Date(),
        },
      });
    }

    // Update appointment status to IN_PROGRESS if confirmed
    if (appointment.status === 'CONFIRMED') {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.json({ message: 'Consultation active', consultation, appointment });
  } catch (err) {
    console.error('Error starting consultation:', err);
    res.status(500).json({ error: 'Failed to start consultation' });
  }
});

// Update consultation notes & diagnosis (Doctor only)
router.patch('/:id/notes', authenticateToken, requireRole(['DOCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clinicalNotes, diagnosis } = req.body;
    const consultationId = req.params.id;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    });

    if (!consultation || consultation.doctor.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized: Doctor did not conduct this consultation' });
      return;
    }

    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        clinicalNotes,
        diagnosis,
      },
    });

    res.json({ consultation: updated, message: 'Consultation notes updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update consultation notes' });
  }
});

// End consultation
router.post('/:appointmentId/end', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { clinicalNotes, diagnosis } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Complete appointment
      const updatedAppt = await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: 'COMPLETED' },
      });

      // Complete consultation
      const updatedConsult = await tx.consultation.upsert({
        where: { appointmentId: appointment.id },
        update: {
          status: 'COMPLETED',
          endedAt: now,
          clinicalNotes: clinicalNotes || undefined,
          diagnosis: diagnosis || undefined,
        },
        create: {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          status: 'COMPLETED',
          startedAt: appointment.dateTime,
          endedAt: now,
          clinicalNotes: clinicalNotes || 'Consultation concluded normally.',
          diagnosis: diagnosis || 'General Telemedicine Evaluation',
        },
      });

      // Notify patient
      await tx.notification.create({
        data: {
          userId: appointment.patient.user.id,
          title: 'Consultation Completed',
          message: `Your consultation with ${appointment.doctor.user.name} has concluded. Any prescriptions or follow-up notes are now available in your portal.`,
          type: 'APPOINTMENT',
          link: '/patient/appointments',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: 'COMPLETE_CONSULTATION',
          resource: 'Consultation',
          resourceId: updatedConsult.id,
          details: `Doctor completed consultation for appointment ${appointment.referenceId}`,
        },
      });

      return { appointment: updatedAppt, consultation: updatedConsult };
    });

    res.json({ message: 'Consultation successfully ended and saved', ...result });
  } catch (err) {
    console.error('Error ending consultation:', err);
    res.status(500).json({ error: 'Failed to complete consultation' });
  }
});

export default router;
