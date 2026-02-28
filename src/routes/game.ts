import { Router, Request, Response } from 'express';
import { GameController } from '../controllers/gameController';
import { requireAuth } from '../middleware/auth';

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
 * /api/game/roll-dice:
 *   post:
 *     summary: Roll dice
 *     description: Roll two dice and return the result. Optionally accepts gameId and playerId for future game state integration.
 *     tags: [Game]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: Optional game identifier
 *                 example: "game-123"
 *               playerId:
 *                 type: string
 *                 description: Optional player identifier
 *                 example: "player-456"
 *     responses:
 *       200:
 *         description: Dice rolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     dice:
 *                       type: array
 *                       items:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 6
 *                       minItems: 2
 *                       maxItems: 2
 *                       example: [3, 5]
 *                     total:
 *                       type: integer
 *                       minimum: 2
 *                       maximum: 12
 *                       example: 8
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-11T13:34:17.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred while rolling dice"
 */
router.post('/roll-dice', requireAuth, GameController.rollDice);

/**
 * @swagger
 * /api/game/end-turn:
 *   post:
 *     summary: End current player's turn
 *     description: End the current player's turn and advance to the next player. RoomCode is retrieved from user token (cookie).
 *     tags: [Game]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Turn ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Missing required properties in token
 *       404:
 *         description: Game not found or unable to end turn
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not your turn"
 */
router.post('/end-turn', requireAuth, GameController.endTurn);

/**
 * @swagger
 * /api/game/state:
 *   get:
 *     summary: Get game state
 *     description: Retrieve the current state of a game for polling. RoomCode is retrieved from user token (cookie).
 *     tags: [Game]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Game state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           player_no:
 *                             type: integer
 *                             example: 1
 *                           position:
 *                             type: integer
 *                             example: 5
 *                           player_money:
 *                             type: integer
 *                             example: 1500
 *                           property_owns:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *                           utility_owns:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *                           transport_owns:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *       400:
 *         description: Missing required properties in token
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal server error
 */
router.get('/state', requireAuth, GameController.getGameState);

/**
 * @swagger
 * /api/game/board:
 *   get:
 *     summary: Get board layout for user's game
 *     description: Retrieve the layout and configuration for the board assigned to the user's game. RoomCode is retrieved from user token (cookie), boardId and version are retrieved from the game settings, and board data is fetched via GameService (which uses BoardService internally).
 *     tags: [Game]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Board layout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Complete board configuration with cells and metadata
 *       400:
 *         description: Missing required properties in token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Required Property not found in token"
 *       404:
 *         description: Game or board not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Board not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving board"
 */
router.get('/board', requireAuth, GameController.getBoard);

/**
 * @swagger
 * /api/game/buy:
 *   post:
 *     summary: Buy property at current position
 *     description: Purchase the property the player has landed on. RoomCode is retrieved from user token (cookie). Player must be in BUY_PROPERTY phase and have sufficient funds.
 *     tags: [Game]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Missing required properties in token or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Insufficient funds to purchase this property"
 *       403:
 *         description: Not player's turn or wrong game phase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not your turn"
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Game not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred while buying property"
 */
router.post('/buy', requireAuth, GameController.buyProperty);

/**
 * @swagger
 * /api/game/pass:
 *   post:
 *     summary: Pass on buying property at current position
 *     description: Decline to purchase the property the player has landed on and proceed to end turn phase. RoomCode is retrieved from user token (cookie). Player must be in BUY_PROPERTY phase.
 *     tags: [Game]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property purchase declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Missing required properties in token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Required Property not found in token"
 *       403:
 *         description: Not player's turn or wrong game phase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not your turn"
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Game not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred while passing property purchase"
 */
router.post('/pass', requireAuth, GameController.passProperty);

export default router;
