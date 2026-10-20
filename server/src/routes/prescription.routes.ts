import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  consultationId: z.string().optional(),
  advice: z.string().optional(),
  items: z.array(
    z.object({
      medicationName: z.string().min(1, 'Medication name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
      instructions: z.string().min(1, 'Instructions are required'),
    })
  ).min(1, 'At least one medication item is required'),
});

// List prescriptions (scoped by role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;
    const where: any = {};

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

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        consultation: {
          include: {
            appointment: {
              select: { referenceId: true, dateTime: true, consultationType: true },
            },
          },
        },
      },
    });

    res.json({ prescriptions });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Failed to retrieve prescriptions' });
  }
});

// Get single prescription
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        consultation: {
          include: {
            appointment: {
              select: { referenceId: true, dateTime: true, consultationType: true },
            },
          },
        },
      },
    });

    if (!prescription) {
      res.status(404).json({ error: 'Prescription not found' });
      return;
    }

    // Role-based access validation
    if (req.user!.role === 'PATIENT' && prescription.patient.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to view this prescription' });
      return;
    }

    res.json({ prescription });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve prescription' });
  }
});

// Issue new digital prescription (Doctor only)
router.post('/', authenticateToken, requireRole(['DOCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createPrescriptionSchema.parse(req.body);

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: true },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor profile not found' });
      return;
    }

    if (doctor.verificationStatus !== 'VERIFIED') {
      res.status(403).json({ error: 'Only verified doctors can issue digital prescriptions' });
      return;
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id: data.patientId },
      include: { user: true },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const referenceNo = `RX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPrescription = await prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.create({
        data: {
          referenceNo,
          doctorId: doctor.id,
          patientId: patient.id,
          consultationId: data.consultationId || null,
          advice: data.advice,
          version: 1,
          issuedAt: new Date(),
        },
      });

      for (const item of data.items) {
        await tx.prescriptionItem.create({
          data: {
            prescriptionId: rx.id,
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
          },
        });
      }

      // Notify Patient
      await tx.notification.create({
        data: {
          userId: patient.userId,
          title: 'Digital Prescription Issued',
          message: `${doctor.user.name} has issued digital prescription ${referenceNo}.`,
          type: 'PRESCRIPTION',
          link: '/patient/prescriptions',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: 'ISSUE_PRESCRIPTION',
          resource: 'Prescription',
          resourceId: rx.id,
          details: `Doctor issued prescription ${referenceNo} to ${patient.user.name}. Items count: ${data.items.length}`,
        },
      });

      return rx;
    });

    const fullPrescription = await prisma.prescription.findUnique({
      where: { id: newPrescription.id },
      include: {
        items: true,
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    res.status(201).json({
      message: 'Prescription issued successfully',
      prescription: fullPrescription,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Error issuing prescription:', err);
    res.status(500).json({ error: 'Failed to issue prescription' });
  }
});

export default router;
