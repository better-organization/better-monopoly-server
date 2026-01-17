import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenUtil, ITokenPayload } from '../utils/TokenUtil';
import { cookieUtil } from '../utils/cookieUtil';

// Extend Express Request to include user data
declare module 'express-serve-static-core' {
  interface Request {
    user?: ITokenPayload;
  }
}

// Authentication middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = cookieUtil.getCookie(req, 'auth_token');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
      return;
    }

    req.user = tokenUtil.verifyToken(token);

    next();
  } catch (error) {
    console.error('Authentication Middleware error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error verifying authentication token',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = cookieUtil.getCookie(req, 'auth_token');

    if (token) {
      req.user = tokenUtil.verifyToken(token);
    }

    next();
  } catch {
    // If token is invalid, just continue without user data
    next();
  }
};
