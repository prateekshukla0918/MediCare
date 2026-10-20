import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect_super_secure_jwt_secret_key_2026';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR']),
  phone: z.string().optional(),
  // Patient fields
  dob: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  // Doctor fields
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  regNumber: z.string().optional(),
  fee: z.number().optional(),
  bio: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', async (req, res): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const isDoctor = data.role === 'DOCTOR';
    const userStatus = isDoctor ? 'PENDING' : 'ACTIVE'; // Doctors require verification

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        status: userStatus,
        phone: data.phone,
      },
    });

    if (isDoctor) {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: data.specialization || 'General Medicine',
          qualifications: data.qualifications || 'Medical Degree',
          regNumber: data.regNumber || `REG-${Date.now().toString().slice(-6)}`,
          bio: data.bio || 'Dedicated medical professional providing telemedicine consultations.',
          fee: data.fee || 80,
          verificationStatus: 'PENDING',
          verificationNotes: 'Newly registered. Pending document submission and admin verification.',
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'REGISTER_DOCTOR_APPLICATION',
          resource: 'User',
          resourceId: user.id,
          details: `Doctor application registered under ${data.specialization || 'General Medicine'}.`,
        },
      });
    } else {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          dob: data.dob,
          gender: data.gender,
          bloodGroup: data.bloodGroup || 'O+',
          allergies: data.allergies || 'None',
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'REGISTER_PATIENT',
          resource: 'User',
          resourceId: user.id,
          details: 'New patient registered.',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Initial welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to MediConnect',
        message: isDoctor
          ? 'Your doctor account application has been received and is pending verification.'
          : 'Welcome! You can now search for verified specialists and schedule consultations.',
        type: 'SECURITY',
        link: isDoctor ? '/doctor/profile' : '/patient/dashboard',
      },
    });

    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      include: { patientProfile: true, doctorProfile: true },
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userDetails!.id,
        name: userDetails!.name,
        email: userDetails!.email,
        role: userDetails!.role,
        status: userDetails!.status,
        phone: userDetails!.phone,
        patientProfileId: userDetails!.patientProfile?.id,
        doctorProfileId: userDetails!.doctorProfile?.id,
        doctorProfile: userDetails!.doctorProfile,
        patientProfile: userDetails!.patientProfile,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

router.post('/login', async (req, res): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { patientProfile: true, doctorProfile: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Your account has been suspended. Please contact administrator.' });
      return;
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatar: user.avatar,
        patientProfileId: user.patientProfile?.id,
        doctorProfileId: user.doctorProfile?.id,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { patientProfile: true, doctorProfile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatar: user.avatar,
        patientProfileId: user.patientProfile?.id,
        doctorProfileId: user.doctorProfile?.id,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Demo account instant switcher for frictionless testing
router.post('/switch-demo', async (req, res): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'patient@mediconnect.com';
    if (role === 'DOCTOR') targetEmail = 'dr.sarah@mediconnect.com';
    if (role === 'ADMIN') targetEmail = 'admin@mediconnect.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { patientProfile: true, doctorProfile: true },
    });

    if (!user) {
      res.status(404).json({ error: `Demo user for role ${role} not found` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatar: user.avatar,
        patientProfileId: user.patientProfile?.id,
        doctorProfileId: user.doctorProfile?.id,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to switch demo account' });
  }
});

export default router;
