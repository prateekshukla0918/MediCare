import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Helper to sanitize formula injection in CSV
function sanitizeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`; // Prepend single quote to neutralize formula execution
  }
  return `"${str}"`;
}

// GET /api/admin/analytics/overview
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '30', specialization, consultationType, status } = req.query;
    const numDays = parseInt(String(days)) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (consultationType && consultationType !== 'ALL') {
      where.consultationType = String(consultationType);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (specialization && specialization !== 'ALL') {
      where.doctor = { specialization: String(specialization) };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: { select: { specialization: true, user: { select: { name: true } } } },
      },
    });

    const now = new Date();
    const totalAppointments = appointments.length;
    const completedConsultations = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShowAppointments = appointments.filter((a) => a.status === 'NO_SHOW').length;

    // Cancellation rate
    const cancellationRate = totalAppointments > 0 
      ? Number(((cancelledAppointments / totalAppointments) * 100).toFixed(1)) 
      : 0;

    // Consultation completion rate (completed / past eligible appointments)
    const pastAppointments = appointments.filter((a) => new Date(a.dateTime) <= now);
    const pastResolvedCount = completedConsultations + cancelledAppointments + noShowAppointments;
    const completionRate = pastResolvedCount > 0 
      ? Number(((completedConsultations / pastResolvedCount) * 100).toFixed(1)) 
      : 0;

    // Average time to appointment (hours)
    let totalWaitHours = 0;
    let validCount = 0;
    appointments.forEach((a) => {
      const waitMs = new Date(a.dateTime).getTime() - new Date(a.createdAt).getTime();
      if (waitMs > 0) {
        totalWaitHours += waitMs / (1000 * 60 * 60);
        validCount++;
      }
    });
    const avgWaitHours = validCount > 0 ? Number((totalWaitHours / validCount).toFixed(1)) : 24.5;

    // Backlog of doctors awaiting verification
    const verificationBacklog = await prisma.doctorProfile.count({
      where: { verificationStatus: 'PENDING' },
    });

    res.json({
      kpis: {
        totalAppointments,
        completedConsultations,
        cancellationRate,
        completionRate,
        avgWaitHours,
        verificationBacklog,
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Failed to generate analytics overview' });
  }
});

// GET /api/admin/analytics/trends (Chart 1: Line Chart)
router.get('/trends', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '30', specialization, consultationType } = req.query;
    const numDays = parseInt(String(days)) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const where: any = {
      dateTime: { gte: startDate },
    };

    if (consultationType && consultationType !== 'ALL') {
      where.consultationType = String(consultationType);
    }
    if (specialization && specialization !== 'ALL') {
      where.doctor = { specialization: String(specialization) };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'asc' },
    });

    // Group by date buckets (e.g. YYYY-MM-DD)
    const buckets: { [key: string]: { date: string; booked: number; completed: number; cancelled: number } } = {};

    for (let i = numDays; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      buckets[key] = { date: displayDate, booked: 0, completed: 0, cancelled: 0 };
    }

    appointments.forEach((a) => {
      const key = a.dateTime.toISOString().split('T')[0];
      if (buckets[key]) {
        buckets[key].booked++;
        if (a.status === 'COMPLETED') buckets[key].completed++;
        if (a.status === 'CANCELLED') buckets[key].cancelled++;
      }
    });

    res.json({ trends: Object.values(buckets) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate trend analytics' });
  }
});

// GET /api/admin/analytics/status-distribution (Chart 2: Status Donut)
router.get('/status-distribution', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '30' } = req.query;
    const numDays = parseInt(String(days)) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const appointments = await prisma.appointment.findMany({
      where: { dateTime: { gte: startDate } },
    });

    const statusCounts: { [key: string]: number } = {
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      IN_PROGRESS: 0,
      NO_SHOW: 0,
    };

    appointments.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      } else {
        statusCounts[a.status] = 1;
      }
    });

    const distribution = [
      { name: 'Completed', value: statusCounts.COMPLETED, color: '#10B981' },
      { name: 'Confirmed', value: statusCounts.CONFIRMED, color: '#3B82F6' },
      { name: 'Cancelled', value: statusCounts.CANCELLED, color: '#EF4444' },
      { name: 'In Progress', value: statusCounts.IN_PROGRESS, color: '#F59E0B' },
      { name: 'No-Show', value: statusCounts.NO_SHOW, color: '#8B5CF6' },
    ];

    res.json({ distribution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate status distribution' });
  }
});

// GET /api/admin/analytics/specializations (Chart 3: Popular Specializations)
router.get('/specializations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: { select: { specialization: true } },
      },
    });

    const specMap: { [spec: string]: { specialization: string; booked: number; completed: number } } = {};

    appointments.forEach((a) => {
      const spec = a.doctor.specialization || 'General';
      if (!specMap[spec]) {
        specMap[spec] = { specialization: spec, booked: 0, completed: 0 };
      }
      specMap[spec].booked++;
      if (a.status === 'COMPLETED') specMap[spec].completed++;
    });

    const result = Object.values(specMap).sort((a, b) => b.booked - a.booked);
    res.json({ specializations: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate specialization stats' });
  }
});

// GET /api/admin/analytics/doctor-workload (Chart 4: Doctor Workload)
router.get('/doctor-workload', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: 'VERIFIED' },
      include: {
        user: { select: { name: true } },
        appointments: { select: { status: true } },
      },
    });

    const workload = doctors.map((doc) => {
      const total = doc.appointments.length;
      const completed = doc.appointments.filter((a) => a.status === 'COMPLETED').length;
      const cancelled = doc.appointments.filter((a) => a.status === 'CANCELLED').length;
      const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

      return {
        doctor: doc.user.name,
        specialization: doc.specialization,
        appointments: total,
        completed,
        cancellationRate: rate,
      };
    }).sort((a, b) => b.appointments - a.appointments);

    res.json({ workload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate doctor workload' });
  }
});

// GET /api/admin/analytics/registrations (Chart 5: Registration Trends)
router.get('/registrations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const dateBuckets: { [date: string]: { date: string; patients: number; doctors: number } } = {};

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateBuckets[key] = { date: displayDate, patients: 0, doctors: 0 };
    }

    users.forEach((u) => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (dateBuckets[key]) {
        if (u.role === 'PATIENT') dateBuckets[key].patients++;
        if (u.role === 'DOCTOR') dateBuckets[key].doctors++;
      }
    });

    res.json({ registrations: Object.values(dateBuckets) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate registration trends' });
  }
});

// GET /api/admin/analytics/export (CSV export with formula injection prevention)
router.get('/export', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = '30', specialization, status, consultationType } = req.query;
    const numDays = parseInt(String(days)) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const where: any = {
      dateTime: { gte: startDate },
    };

    if (consultationType && consultationType !== 'ALL') where.consultationType = String(consultationType);
    if (status && status !== 'ALL') where.status = String(status);
    if (specialization && specialization !== 'ALL') where.doctor = { specialization: String(specialization) };

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'desc' },
      include: {
        doctor: {
          select: {
            specialization: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    // Generate CSV Header
    const headers = ['Reference ID', 'Doctor Name', 'Specialization', 'Consultation Type', 'Scheduled Date', 'Status', 'Booking Created At'];
    const rows = [headers.join(',')];

    appointments.forEach((a) => {
      const row = [
        sanitizeCsvField(a.referenceId),
        sanitizeCsvField(a.doctor.user.name),
        sanitizeCsvField(a.doctor.specialization),
        sanitizeCsvField(a.consultationType),
        sanitizeCsvField(a.dateTime.toISOString()),
        sanitizeCsvField(a.status),
        sanitizeCsvField(a.createdAt.toISOString()),
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');

    // Audit log the export
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: 'EXPORT_ANALYTICS_CSV',
        resource: 'Analytics',
        details: `Exported ${appointments.length} records with filter days=${days}`,
      },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mediconnect_analytics_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

export default router;
