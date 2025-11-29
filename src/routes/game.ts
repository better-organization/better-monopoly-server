import { Router, Request, Response } from 'express';

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
// router.post('/create', gameController.createGame);
// router.get('/:gameId', gameController.getGame);
// router.post('/:gameId/join', gameController.joinGame);
// router.post('/:gameId/move', gameController.makeMove);
// router.get('/:gameId/status', gameController.getGameStatus);

export = router;
