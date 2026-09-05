import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/customer.repository';
import { User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const demoUserId = req.headers['x-demo-user-id'] as string;

    // Support quick demo switching via x-demo-user-id for hackathon presentation ease
    if (demoUserId) {
      const user = await UserRepository.findById(demoUserId);
      if (user) {
        req.user = user;
        next();
        return;
      }
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyToken(token);
    const user = await UserRepository.findById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User associated with token no longer exists' },
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: error.message || 'Token verification failed' },
    });
  }
}
