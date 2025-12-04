import { Router, Request, Response } from 'express';
import { BoardController } from '../controllers/boardController';

const router = Router();

/**
 * @swagger
 * /api/game/test:
 *   get:
 *     summary: Test game service
 *     description: Check if the game service is running properly
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Game service is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Game service is working!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Game service is working!',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/game/board/{boardId}/version/{version}:
 *   get:
 *     summary: Get board layout
 *     description: Retrieve the layout and configuration for a specific board and version
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Board identifier (e.g., "european_football_club_giants")
 *         example: "european_football_club_giants"
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: Board version number
 *         example: "1.0"
 *     responses:
 *       200:
 *         description: Board layout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Complete board configuration with cells and metadata
 *       404:
 *         description: Board not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Board not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get('/board/:boardId/version/:version', BoardController.getBoardLayout);

export default router;
