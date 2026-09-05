import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';
import { UserRepository } from '../repositories/customer.repository';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = LoginSchema.parse(req.body);
      const result = await AuthService.login(email);

      if (!result) {
        sendError(res, 'INVALID_CREDENTIALS', 'User with provided email does not exist.', 401);
        return;
      }

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
        return;
      }

      const user = await AuthService.getMe(req.user.id);
      sendSuccess(res, user, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserRepository.getAll();
      sendSuccess(res, users, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {}, 'Logged out successfully');
  }
}
