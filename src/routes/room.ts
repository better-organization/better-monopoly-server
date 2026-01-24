import { RoomController } from '../controllers/roomController';
import { Router } from 'express';
import { RoomService } from '../services/roomService';
import { requireAuth } from '../middleware/auth';

const router = Router();

const roomService = RoomService.getInstance();
const roomController = new RoomController(roomService);

/**
 * @swagger
 * /api/room/create:
 *   post:
 *     summary: Create a new game room
 *     description: Create a new room with a unique room code. The creator (identified by JWT token) is automatically added as a player. Requires authentication via auth_token cookie.
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRoomResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Updated auth_token with roomId
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly
 *       400:
 *         description: Bad request - username not found in token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to create room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', requireAuth, roomController.createRoom);

/**
 * @swagger
 * /api/room/status:
 *   get:
 *     summary: Get room status and information
 *     description: Retrieve the current status of the room, including room details and list of players. The room is identified from the JWT token. Requires authentication via auth_token cookie.
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Room status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomStatusResponse'
 *       400:
 *         description: Bad request - username or roomId not found in token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingUsername:
 *                 value:
 *                   error: "Bad Request"
 *                   message: "username not found in authentication token"
 *               missingRoomId:
 *                 value:
 *                   error: "Bad Request"
 *                   message: "roomId not found in authentication token"
 *       401:
 *         description: Unauthorized - missing or invalid auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not Found"
 *               message: "Room not found"
 */
router.get('/status', requireAuth, roomController.roomStatus);

/**
 * @swagger
 * /api/room/join:
 *   post:
 *     summary: Join an existing game room
 *     description: Join a room using a room code provided in the request body. The user (identified by JWT token) will be added to the room's player list. Upon successful join, the JWT token will be updated with the room code. Requires authentication via auth_token cookie.
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinRoomRequest'
 *           example:
 *             roomCode: "123456"
 *     responses:
 *       200:
 *         description: Successfully joined the room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JoinRoomResponse'
 *             example:
 *               success: true
 *               message: "Joined room successfully"
 *         headers:
 *           Set-Cookie:
 *             description: Updated auth_token with roomCode
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly
 *       400:
 *         description: Bad request - username not found in token, roomCode not provided, or failed to join room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingUsername:
 *                 value:
 *                   error: "Bad Request"
 *                   message: "username not found in authentication token"
 *               missingRoomCode:
 *                 value:
 *                   error: "Bad Request"
 *                   message: "roomCode not found in request"
 *               failedToJoin:
 *                 value:
 *                   success: false
 *                   message: "Failed to join room"
 *       401:
 *         description: Unauthorized - missing or invalid auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error while joining room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "An error occurred while trying to join the room"
 */
router.post('/join', requireAuth, roomController.joinRoom);

/**
 * @swagger
 * /api/room/start:
 *   post:
 *     summary: Start the game in a room
 *     description: Start the game for all players in the room. Creates a game instance and assigns its ID to the room. Only the room host (first player who created the room) can start the game. Requires minimum number of players to be met. The room is identified from the JWT token via roomCode. Requires authentication via auth_token cookie.
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Game started successfully
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
 *                   example: "Game started successfully"
 *       400:
 *         description: Bad request - missing token data, not enough players, or game already started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingToken:
 *                 value:
 *                   success: false
 *                   message: "Required Property not found in token"
 *               notEnoughPlayers:
 *                 value:
 *                   success: false
 *                   message: "Not enough players to start the game. Minimum 2 players required"
 *               alreadyStarted:
 *                 value:
 *                   success: false
 *                   message: "Game has already started"
 *       401:
 *         description: Unauthorized - missing or invalid auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user is not the room host
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Only the room host can start the game"
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Room not found"
 *       500:
 *         description: Internal server error while starting game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "An error occurred while starting the game"
 */
router.post('/start', requireAuth, roomController.startGame);

export default router;
