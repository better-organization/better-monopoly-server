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

export default router;
