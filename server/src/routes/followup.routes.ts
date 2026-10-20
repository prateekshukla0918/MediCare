import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// List follow-ups
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

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { recommendedDate: 'asc' },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
          },
        },
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        consultation: {
          select: { id: true, diagnosis: true, clinicalNotes: true },
        },
      },
    });

    res.json({ followUps });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve follow-ups' });
  }
});

// Create follow-up recommendation (Doctor only)
router.post('/', authenticateToken, requireRole(['DOCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, consultationId, recommendedDate, instructions } = req.body;

    if (!patientId || !recommendedDate || !instructions) {
      res.status(400).json({ error: 'Patient, recommended date, and instructions are required' });
      return;
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: true },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const recDate = new Date(recommendedDate);

    const followUp = await prisma.followUp.create({
      data: {
        patientId,
        doctorId: doctor.id,
        consultationId: consultationId || null,
        recommendedDate: recDate,
        instructions,
        status: 'PENDING',
      },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        title: 'Follow-Up Recommended',
        message: `${doctor.user.name} recommended a follow-up consultation on ${recDate.toLocaleDateString()}. Instructions: ${instructions}`,
        type: 'FOLLOW_UP',
        link: '/patient/follow-ups',
      },
    });

    res.status(201).json({ message: 'Follow-up created successfully', followUp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create follow-up' });
  }
});

// Update follow-up status (e.g. mark SCHEDULED or COMPLETED)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const followUp = await prisma.followUp.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ followUp, message: 'Follow-up status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
});

export default router;
