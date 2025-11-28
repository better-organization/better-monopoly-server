import { Router, Request, Response } from 'express';

const router = Router();

// Test endpoint for authentication
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is working!',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Implement actual authentication endpoints
// router.post('/login', authController.login);
// router.post('/register', authController.register);
// router.post('/logout', authController.logout);
// router.get('/me', authMiddleware, authController.getProfile);

export = router;
