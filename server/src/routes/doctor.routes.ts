import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Public doctor discovery directory
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, specialization, language, maxFee, sort } = req.query;

    const where: any = {
      verificationStatus: 'VERIFIED',
      user: {
        status: 'ACTIVE',
      },
    };

    if (specialization && specialization !== 'All') {
      where.specialization = String(specialization);
    }

    if (maxFee) {
      where.fee = { lte: parseFloat(String(maxFee)) };
    }

    if (language && language !== 'All') {
      where.languages = { contains: String(language) };
    }

    let doctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        availabilities: {
          where: { isActive: true },
        },
      },
    });

    if (search) {
      const term = String(search).toLowerCase();
      doctors = doctors.filter(
        (doc) =>
          doc.user.name.toLowerCase().includes(term) ||
          doc.specialization.toLowerCase().includes(term) ||
          doc.bio.toLowerCase().includes(term) ||
          doc.qualifications.toLowerCase().includes(term)
      );
    }

    if (sort === 'fee_low') {
      doctors.sort((a, b) => a.fee - b.fee);
    } else if (sort === 'fee_high') {
      doctors.sort((a, b) => b.fee - a.fee);
    } else if (sort === 'experience') {
      doctors.sort((a, b) => b.experienceYears - a.experienceYears);
    }

    res.json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Failed to retrieve doctors list' });
  }
});

// Single doctor profile
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        availabilities: {
          where: { isActive: true },
        },
      },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve doctor profile' });
  }
});

// Calculate live available time slots for a chosen date
router.get('/:id/slots', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.params.id;
    const dateParam = String(req.query.date || '');

    if (!dateParam) {
      res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
      return;
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      res.json({ slots: [], message: 'Doctor is not available on this day of the week' });
      return;
    }

    // Parse start and end times e.g. "09:00" and "17:00"
    const [startH, startM] = availability.startTime.split(':').map(Number);
    const [endH, endM] = availability.endTime.split(':').map(Number);
    const slotDuration = availability.slotDuration || 30; // in mins

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Fetch existing active bookings for this doctor on target date
    const dayStart = new Date(dateParam);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateParam);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    const bookedTimes = new Set(
      existingAppointments.map((apt) => {
        const d = new Date(apt.dateTime);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      })
    );

    const slots: { time: string; available: boolean }[] = [];
    for (let current = startMinutes; current + slotDuration <= endMinutes; current += slotDuration) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Check if slot has already passed for today
      const now = new Date();
      const slotDateTime = new Date(dateParam);
      slotDateTime.setHours(h, m, 0, 0);
      const isPast = slotDateTime <= now;

      slots.push({
        time: timeStr,
        available: !bookedTimes.has(timeStr) && !isPast,
      });
    }

    res.json({ slots });
  } catch (err) {
    console.error('Error generating slots:', err);
    res.status(500).json({ error: 'Failed to generate available slots' });
  }
});

// Update doctor profile (Doctor only)
router.patch('/profile', authenticateToken, requireRole(['DOCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, qualifications, bio, fee, languages, clinicHospital } = req.body;

    const updated = await prisma.doctorProfile.update({
      where: { userId: req.user!.id },
      data: {
        specialization,
        qualifications,
        bio,
        fee: fee ? parseFloat(fee) : undefined,
        languages,
        clinicHospital,
      },
    });

    res.json({ doctor: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
});

// Update weekly availability (Doctor only)
router.put('/availability', authenticateToken, requireRole(['DOCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { schedule } = req.body; // array of { dayOfWeek, startTime, endTime, slotDuration, isActive }
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!doctorProfile) {
      res.status(404).json({ error: 'Doctor profile not found' });
      return;
    }

    // Delete existing availabilities and recreate
    await prisma.doctorAvailability.deleteMany({
      where: { doctorId: doctorProfile.id },
    });

    if (Array.isArray(schedule)) {
      for (const item of schedule) {
        await prisma.doctorAvailability.create({
          data: {
            doctorId: doctorProfile.id,
            dayOfWeek: Number(item.dayOfWeek),
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '17:00',
            slotDuration: Number(item.slotDuration || 30),
            bufferTime: Number(item.bufferTime || 10),
            isActive: item.isActive !== false,
          },
        });
      }
    }

    const updatedAvailabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctorProfile.id },
    });

    res.json({ availabilities: updatedAvailabilities, message: 'Availability schedule updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

export default router;
