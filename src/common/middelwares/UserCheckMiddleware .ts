// src/common/middleware/user-check.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserCheckMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.SECRET_JWT_ACCESS;

    if (!jwtSecret) {
      throw new Error('JWT secret is not defined in environment variables');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);

      
      if (typeof decoded !== 'object' || !decoded || !('userId' in decoded)) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const userId = (decoded as { userId: string }).userId;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

    
      req['user'] = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
}
