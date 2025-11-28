import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Better Monopoly Server is healthy!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// Readiness probe
router.get('/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is ready to accept connections',
    timestamp: new Date().toISOString()
  });
});

// Liveness probe
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is alive',
    timestamp: new Date().toISOString()
  });
});

export = router;
