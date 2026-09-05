import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepository } from '../repositories/customer.repository';
import { User, UserRole } from '../types';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  customerId?: string;
}

export class AuthService {
  public static generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
    };

    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  }

  public static verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
  }

  public static async login(email: string): Promise<{ token: string; user: User } | null> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return null;

    const token = this.generateToken(user);
    return { token, user };
  }

  public static async getMe(userId: string): Promise<User | null> {
    return UserRepository.findById(userId);
  }
}
