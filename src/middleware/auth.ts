import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No token provided.',
        },
      });
      return;
    }

    // TODO: Implement token verification when AuthService is complete
    // const user = await AuthService.verifyToken(token);
    // if (!user) {
    //   return res.status(401).json({
    //     success: false,
    //     error: {
    //       message: 'Invalid token.'
    //     }
    //   });
    // }

    // Temporary implementation for development
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key'
    ) as any;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token.',
      },
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // TODO: Implement token verification when AuthService is complete
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev-secret-key'
      ) as any;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
