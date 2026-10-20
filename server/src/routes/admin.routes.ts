import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Apply admin role guard across all admin routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Page 18: Admin Overview
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalPatients = await prisma.patientProfile.count();
    const activeDoctors = await prisma.doctorProfile.count({
      where: { verificationStatus: 'VERIFIED' },
    });
    const pendingVerifications = await prisma.doctorProfile.count({
      where: { verificationStatus: 'PENDING' },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const appointmentsToday = await prisma.appointment.count({
      where: {
        dateTime: { gte: todayStart, lt: todayEnd },
      },
    });

    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({
      where: { status: 'COMPLETED' },
    });
    const cancelledAppointments = await prisma.appointment.count({
      where: { status: 'CANCELLED' },
    });

    const cancellationRate = totalAppointments > 0 
      ? Math.round((cancelledAppointments / totalAppointments) * 100) 
      : 0;

    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      metrics: {
        totalPatients,
        activeDoctors,
        pendingVerifications,
        appointmentsToday,
        completedAppointments,
        cancellationRate,
      },
      recentAuditLogs,
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    res.status(500).json({ error: 'Failed to retrieve admin overview' });
  }
});

// Page 19: Doctor Verification Queue
router.get('/doctors/pending', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pendingDoctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ doctors: pendingDoctors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending doctor verifications' });
  }
});

// Review doctor verification (Approve or Reject with reason)
router.patch('/doctors/:id/verification', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, reason } = req.body; // status: 'VERIFIED' | 'REJECTED'
    const doctorId = req.params.id;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Status must be either VERIFIED or REJECTED' });
      return;
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedDoctor = await tx.doctorProfile.update({
        where: { id: doctorId },
        data: {
          verificationStatus: status,
          verificationNotes: reason || (status === 'VERIFIED' ? 'Credentials verified by admin' : 'Application declined'),
        },
      });

      // Update user account status
      await tx.user.update({
        where: { id: doctor.userId },
        data: {
          status: status === 'VERIFIED' ? 'ACTIVE' : 'SUSPENDED',
        },
      });

      // Notify Doctor
      await tx.notification.create({
        data: {
          userId: doctor.userId,
          title: status === 'VERIFIED' ? 'Doctor Verification Approved' : 'Doctor Application Update',
          message: status === 'VERIFIED'
            ? 'Congratulations! Your medical credentials have been verified. You can now accept patient bookings.'
            : `Your verification application was not approved. Reason: ${reason || 'Incomplete credentials'}`,
          type: 'VERIFICATION',
          link: '/doctor/dashboard',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: status === 'VERIFIED' ? 'APPROVE_DOCTOR' : 'REJECT_DOCTOR',
          resource: 'DoctorProfile',
          resourceId: doctorId,
          details: `Verification decision by ${req.user!.name}. Result: ${status}. Reason: ${reason || 'N/A'}`,
        },
      });

      return updatedDoctor;
    });

    res.json({ message: `Doctor ${status.toLowerCase()} successfully`, doctor: result });
  } catch (err) {
    console.error('Error verifying doctor:', err);
    res.status(500).json({ error: 'Failed to process verification' });
  }
});

// Page 20: User Management
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const where: any = {};

    if (role && role !== 'ALL') where.role = String(role);
    if (status && status !== 'ALL') where.status = String(status);

    let users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        doctorProfile: {
          select: { specialization: true, verificationStatus: true, regNumber: true },
        },
      },
    });

    if (search) {
      const term = String(search).toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Activate or Suspend user
router.patch('/users/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body; // 'ACTIVE' | 'SUSPENDED'
    const targetUserId = req.params.id;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Status must be ACTIVE or SUSPENDED' });
      return;
    }

    if (targetUserId === req.user!.id) {
      res.status(400).json({ error: 'Admins cannot suspend their own account' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: targetUserId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user!.id,
          actorName: req.user!.name,
          action: status === 'ACTIVE' ? 'ACTIVATE_USER' : 'SUSPEND_USER',
          resource: 'User',
          resourceId: targetUserId,
          details: `Admin changed status to ${status} for user ${user.name} (${user.email})`,
        },
      });

      return user;
    });

    res.json({ message: `User status updated to ${status}`, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Page 21: Appointment Management
router.get('/appointments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, date, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = String(status);

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Audit Logs
router.get('/audit-logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
