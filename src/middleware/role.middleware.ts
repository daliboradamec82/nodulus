import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CUSTOMER1 = 'CUSTOMER1',
  CUSTOMER2 = 'CUSTOMER2'
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

/**
 * Middleware pro kontrolu, zda je uživatel přihlášen
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    req.user = { userId: decoded.userId, role: UserRole.CUSTOMER1 }; // Default role, bude aktualizováno z DB
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware pro kontrolu specifické role
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Middleware pro kontrolu admin oprávnění
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};

/**
 * Middleware pro kontrolu super admin oprávnění
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json({ message: 'Super admin access required' });
    return;
  }

  next();
};

/**
 * Middleware pro kontrolu oprávnění
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const rolePermissions = {
      [UserRole.SUPER_ADMIN]: ['manage_users', 'manage_roles', 'view_logs', 'manage_settings'],
      [UserRole.ADMIN]: ['manage_users', 'view_logs'],
      [UserRole.CUSTOMER1]: ['view_own_data'],
      [UserRole.CUSTOMER2]: ['view_own_data', 'view_reports']
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}; 