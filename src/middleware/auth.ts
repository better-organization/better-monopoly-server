import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenUtil, ITokenPayload } from '../utils/TokenUtil';
import { cookieUtil } from '../utils/cookieUtil';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

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
        message: RESPONSE_MESSAGES.AUTH_TOKEN_REQUIRED,
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
        message: RESPONSE_MESSAGES.TOKEN_EXPIRED,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.TOKEN_VERIFICATION_ERROR,
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
