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
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is working!',
    timestamp: new Date().toISOString(),
  });
});

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
router.post('/userIdExists', authLimiter, userIdExists);

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
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and receive JWT token. Rate limited to 5 requests per 15 minutes in production.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
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
router.post('/login', authLimiter, login);

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

export = router;
