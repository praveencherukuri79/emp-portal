import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/enums';

// Extend Express Request type with user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: UserRole;
      tenantId: string;
    };
    tenantId?: string;
  }
}

// Role hierarchy: higher number = more permissions
const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.PROSPECT]: 0,
  [UserRole.EMPLOYEE]: 1,
  [UserRole.HR]: 2,
  [UserRole.SUPERVISOR]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.EMPLOYER]: 5
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production') as {
      userId: string;
      email: string;
      tenantId: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token'});
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Authorize specific roles (exact match)
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
      return;
    }
    next();
  };
};

/**
 * Authorize minimum role level (hierarchical)
 * @param minRole - Minimum required role
 */
export const authorizeMinRole = (minRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;
    
    if (userRoleLevel < minRoleLevel) {
      res.status(403).json({ 
        message: 'Forbidden - Insufficient permissions',
        required: minRole,
        current: req.user.role
      });
      return;
    }
    next();
  };
};

/**
 * Check if user can approve/manage another user's data
 * Supervisors can manage employees, HR can manage employees/supervisors, etc.
 */
export const canManage = (targetRole: string, userRole: string): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel > targetLevel;
};
