import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

// Express 5's default ParamsDictionary types values as `string | string[]`,
// and req.query as ParsedQs. Both break Prisma's type inference downstream,
// so we narrow them to plain strings.
export interface AuthRequest extends Request<
  Record<string, string>, // params
  any, // res body
  any, // req body
  Record<string, string | undefined> // query
> {
  user?: {
    id: string;
    email: string;
    role: string;
    patientProfileId?: string;
    doctorProfileId?: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'mediconnect_super_secure_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'User account suspended or not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientProfileId: user.patientProfile?.id,
      doctorProfileId: user.doctorProfile?.id,
    };

    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role` });
      return;
    }
    next();
  };
};
