import { Router, Request, Response } from 'express';
import { BoardController } from '../controllers/boardController';

const router = Router();

// Test endpoint for game service
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Game service is working!',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Implement actual game endpoints
router.get('/board/:boardId/version/:version', BoardController.getBoardLayout);

export default router;
