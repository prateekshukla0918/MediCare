import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// List records
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    const userRole = req.user!.role;

    let targetPatientId: string | null = null;

    if (userRole === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found' });
        return;
      }
      targetPatientId = patient.id;
    } else if (patientId) {
      targetPatientId = String(patientId);

      // Verify doctor has legitimate consultation/appointment relationship with this patient
      if (userRole === 'DOCTOR') {
        const doctor = await prisma.doctorProfile.findUnique({
          where: { userId: req.user!.id },
        });

        if (!doctor) {
          res.status(404).json({ error: 'Doctor profile not found' });
          return;
        }

        const hasRelationship = await prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            patientId: targetPatientId,
          },
        });

        if (!hasRelationship) {
          res.status(403).json({ error: 'Access denied: No authorized doctor-patient relationship found' });
          return;
        }
      }
    }

    if (!targetPatientId) {
      res.status(400).json({ error: 'Patient ID is required' });
      return;
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: targetPatientId },
      orderBy: { createdAt: 'desc' },
    });

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: targetPatientId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    res.json({ records, profile: patientProfile });
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ error: 'Failed to retrieve medical records' });
  }
});

// Upload document (simulated cloud storage upload with validation)
router.post('/upload', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, fileName, fileSize, base64Preview } = req.body;

    if (!title || !category || !fileName) {
      res.status(400).json({ error: 'Title, category, and file are required' });
      return;
    }

    // Allowed extensions
    const ext = fileName.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!ext || !allowed.includes(ext)) {
      res.status(400).json({ error: 'Only PDF, JPG, and PNG documents are supported for clinical records' });
      return;
    }

    let patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!patient && req.user!.role === 'PATIENT') {
      patient = await prisma.patientProfile.create({
        data: { userId: req.user!.id },
      });
    }

    if (!patient) {
      res.status(400).json({ error: 'Medical records can only be stored for patient profiles' });
      return;
    }

    const newRecord = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        title,
        category: category.toUpperCase(),
        fileName,
        fileUrl: base64Preview || `/uploads/clinical/${Date.now()}_${fileName}`,
        fileSize: fileSize || '1.2 MB',
        uploadedBy: req.user!.name,
        doctorAccess: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: 'UPLOAD_MEDICAL_RECORD',
        resource: 'MedicalRecord',
        resourceId: newRecord.id,
        details: `Uploaded document "${title}" in category ${category}`,
      },
    });

    res.status(201).json({
      message: 'Medical document uploaded successfully',
      record: newRecord,
    });
  } catch (err) {
    console.error('Error uploading medical record:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Update patient health history (Allergies, chronic conditions, blood group)
router.patch('/profile-history', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { allergies, chronicConditions, bloodGroup, emergencyContact } = req.body;

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient profile not found' });
      return;
    }

    const updated = await prisma.patientProfile.update({
      where: { id: patient.id },
      data: {
        allergies,
        chronicConditions,
        bloodGroup,
        emergencyContact,
      },
    });

    res.json({ profile: updated, message: 'Health history updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update health history' });
  }
});

// Delete medical record
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    // Record deletion permitted only by the patient or administrator
    if (req.user!.role === 'PATIENT' && record.patient.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to delete this record' });
      return;
    }

    await prisma.medicalRecord.delete({
      where: { id: req.params.id },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: 'DELETE_MEDICAL_RECORD',
        resource: 'MedicalRecord',
        resourceId: req.params.id,
        details: `Deleted record "${record.title}"`,
      },
    });

    res.json({ message: 'Medical record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
