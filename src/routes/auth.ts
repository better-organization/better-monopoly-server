import { Router } from 'express';
import {
  getProfile,
  login,
  logout,
  register,
  userIdExists,
} from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/auth/userIdExists:
 *   post:
 *     summary: Check if userId is available
 *     description: Validate if a userId is available for registration. Rate limited to 5 requests per 15 minutes in production.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserIdCheckRequest'
 *     responses:
 *       200:
 *         description: UserId is available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserIdCheckResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: UserId already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.post('/userIdExists', userIdExists);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with username, password, and unique userId. Rate limited to 5 requests per 15 minutes in production.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               requiredFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Validation failed"
 *                   message: "Username, password, and userId are required"
 *               usernameLength:
 *                 summary: Username too short
 *                 value:
 *                   error: "Validation failed"
 *                   message: "Username must be at least 3 characters long"
 *               passwordLength:
 *                 summary: Password too short
 *                 value:
 *                   error: "Validation failed"
 *                   message: "Password must be at least 6 characters long"
 *               usernamePattern:
 *                 summary: Invalid username pattern
 *                 value:
 *                   error: "Validation failed"
 *                   message: "Username can only contain letters, numbers, and underscores"
 *       409:
 *         description: UserId already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and receive JWT token in httpOnly cookie. Rate limited to 5 requests per 15 minutes in production.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful - auth_token cookie set
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=None
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
 *                   example: "Login successful"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the user's session and remove the JWT token. (Not Implemented)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       501:
 *         description: Not implemented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotImplementedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile (Not Implemented)
 *     description: Retrieve authenticated user's profile. This endpoint is planned for future implementation with JWT authentication middleware.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully (future implementation)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   example: "player-123-unique"
 *                 username:
 *                   type: string
 *                   example: "player123"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       501:
 *         description: Not implemented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotImplementedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Test authentication service
 *     description: Check if the authentication service is running properly
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication service is working
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.get('/test', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is working!',
    timestamp: new Date().toISOString(),
  });
});

export = router;
