import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export function roleGuard(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    // ADMIN always has full access
    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `User with role ${req.user.role} is not authorized for this operation. Required: ${allowedRoles.join(', ')}`,
      },
    });
  };
}
