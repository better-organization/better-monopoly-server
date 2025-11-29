import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getProfile,
  userIdExists,
} from '../controllers/authController';

const router = Router();

// Rate limiting specifically for auth endpoints (disabled in test environment)
const authLimiter =
  process.env['NODE_ENV'] === 'test'
    ? (_req: Request, _res: Response, next: NextFunction) => next() // No rate limiting in tests
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
        message: {
          error: 'Too Many Requests',
          message:
            'Too many authentication attempts from this IP, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });

// Test endpoint for authentication service
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is working!',
    timestamp: new Date().toISOString(),
  });
});

// Authentication endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/userIdExists', authLimiter, userIdExists);
router.get('/profile', getProfile); // TODO: Add auth middleware later

export = router;
