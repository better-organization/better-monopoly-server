import { Request, Response, NextFunction } from 'express';

// Authentication middleware
export const requireAuth = (
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  next();
};
